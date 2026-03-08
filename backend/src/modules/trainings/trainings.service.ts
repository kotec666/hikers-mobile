import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
	DebugTrainingRouteNode,
	training,
	trainingInvites,
	trainingMetrics,
	trainingParticipants,
	trainingRoutes,
	users,
	userSubscribers,
} from '../database/schema';
import { TrainingDto, TrainingMetricsDto, TrainingParticipantDto } from './trainings.dto';
import { eq, and, isNull, isNotNull, inArray, sql } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { CommonDto } from '../../common/dto/common.dto';
import { TrainingType } from '@shared/enums';
import { round, clampToPg } from '@helpers';
import { calculateCalories, haversineDistance } from '@shared/helpers';
import { desc } from '../database/extensions';

const MAX_TIME_TO_SYNC_AFTER_FINISH_TRAINING = 60 * 1000; // 1 минута

@Injectable()
export class TrainingsService {
	constructor(private readonly db: DatabaseService) {
		// @TODO интервал на чистку пустых тренировок
		// @TODO восстановление тренировок на паузе из бд
	}

	public async start(userId: string, dto: TrainingDto.Start): Promise<TrainingDto.Entity> {
		const activeTrainings = await this.getActive(userId, false);
		if (activeTrainings.length > 0) {
			throw new BadRequestException(ERRORS.USER_IN_NOT_FINISHED_TRAINING);
		}

		if (typeof dto.ts !== 'undefined') {
			if (Date.now() < dto.ts) {
				throw new ConflictException(`_ts:${ERRORS.DATE_IN_THE_FUTURE}`);
			}
		}

		const upsertQuery = {
			type: dto.type,
			userCreatorId: userId,
			startedAt: dto.ts ? new Date(dto.ts) : new Date(),
		};
		const returningQuery = {
			id: training.id,
			type: training.type,
			createdAt: training.createdAt,
			startedAt: training.startedAt,
			finishedAt: training.finishedAt,
		};

		// Созданная тренировка может быть только в единственном экземпляре
		const [createdTraining] = await this.getCreated(userId, false);

		// При этом - если юзер не создатель этой трени, то обновить её он не может
		if (createdTraining && createdTraining.creatorId !== userId) {
			throw new BadRequestException(ERRORS.USER_IN_NOT_FINISHED_TRAINING);
		}

		return await this.db.db.transaction(async (tx) => {
			// Обновляем существующюю или создаем новую
			// (просто удалить существующюю нельзя - т.к. на ней могут висеть инвайты)
			const [trainingRow] = createdTraining
				? await tx
						.update(training)
						.set(upsertQuery)
						.where(eq(training.id, createdTraining.id))
						.returning(returningQuery)
				: await tx.insert(training).values(upsertQuery).returning(returningQuery);

			// Если тренировка уже создана, значит участник уже добавлен
			if (createdTraining) return trainingRow;

			const [participant] = await tx
				.insert(trainingParticipants)
				.values({
					trainingId: trainingRow.id,
					colorHex: dto.colorHex,
					userId,
				})
				.returning({
					id: trainingParticipants.id,
				});

			await tx.insert(trainingRoutes).values({
				participantId: participant.id,
				points: [],

				createdAt: new Date(),
			});

			// P.S. Для участников таблицы создаются в момент принятия инвайтов (@TODO не забыть),
			// метрики для всех будут созданы в конце после завершения трени

			return trainingRow;
		});
	}

	public async finish(userId: string, ts?: number): Promise<CommonDto.BooleanResponse> {
		// Создатель может завершить только активную треню - находим её
		const [activeTraining] = await this.getActive(userId, true);
		if (!activeTraining) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		if (typeof ts !== 'undefined' && activeTraining.startedAt) {
			if (ts < activeTraining.startedAt.getTime()) {
				throw new ConflictException(`_ts:${ERRORS.DATE_IN_THE_PAST}`);
			}
		}

		return await this.db.db.transaction(async (tx) => {
			await tx
				.update(training)
				.set({
					finishedAt: ts ? new Date(ts) : new Date(),
				})
				.where(eq(training.id, activeTraining.id));

			// Удаляем неактуальные инвайты
			await tx.delete(trainingInvites).where(eq(trainingInvites.trainingId, activeTraining.id));

			// Всем участникам просчитываем метрики
			const participants = await this.getExtendedParticipants(activeTraining.id);

			for (const participant of participants) {
				await tx.insert(trainingMetrics).values({
					participantId: participant.id,
					...this.calcMetrics(participant, activeTraining.type),
				});
			}

			return { success: true };
		});
	}

	public async sync(userId: string, trainingId: string, dto: TrainingDto.Sync): Promise<CommonDto.BooleanResponse> {
		// @TODO в будущем проверить проблему - если синхра с фронта придет быстрее, чем в обработается предыдущяя
		const training = await this.getByIdAndParticipant(trainingId, userId);

		if (!training.startedAt) {
			// Нельзя досылать метрики в неначавщуюся тренировку
			throw new NotFoundException(ERRORS.NOT_FOUND);
		} else if (training.finishedAt) {
			const dateDiff = new Date().getTime() - training.finishedAt.getTime();

			// Если метрики досылаются после завершения трени - проверям временное окно
			if (dateDiff > MAX_TIME_TO_SYNC_AFTER_FINISH_TRAINING) {
				throw new GoneException(ERRORS.TIMEOUT_EXPIRED);
			}
		}

		const points: DebugTrainingRouteNode[] = [];
		if (dto.metrics.length > 1) {
			dto.metrics.reduce((prev, curr) => {
				points.push({
					rel_ts: curr.relTs,
					distance: haversineDistance(curr.lat, curr.lng, prev.lat, prev.lng),
					speed_kmh: curr.speed_kmh,
					alt: curr.alt,

					paused: curr.paused,
					lat: curr.lat,
					lng: curr.lng,
					locationObject: curr.locationObject,
				});

				return curr;
			});
		} else if (dto.metrics.length === 1) {
			points.push({
				rel_ts: dto.metrics[0].relTs,
				distance: 0,
				speed_kmh: dto.metrics[0].speed_kmh,
				alt: dto.metrics[0].alt,

				paused: dto.metrics[0].paused,
				lat: dto.metrics[0].lat,
				lng: dto.metrics[0].lng,

				locationObject: dto.metrics[0].locationObject,
			});
		}

		await this.upsertRoute(training.participant, points);

		return { success: true };
	}

	private async upsertRoute(
		participant: TrainingParticipantDto.Entity,
		metrics: DebugTrainingRouteNode[],
	): Promise<void> {
		const [trainingRoute] = await this.db.db
			.select({
				id: trainingRoutes.id,
				points: trainingRoutes.points,
			})
			.from(trainingRoutes)
			.where(eq(trainingRoutes.participantId, participant.id))
			.limit(1);

		const updatedPoints = (trainingRoute?.points ?? []).concat(metrics);
		// Сортируем в порядке возрастания rel_ts
		updatedPoints.sort((a, b) => {
			if (a.rel_ts > b.rel_ts) {
				return 1;
			}
			if (a.rel_ts < b.rel_ts) {
				return -1;
			}
			return 0;
		});

		if (trainingRoute) {
			await this.db.db
				.update(trainingRoutes)
				.set({
					points: updatedPoints,
				})
				.where(eq(trainingRoutes.id, trainingRoute.id));
		} else {
			await this.db.db.insert(trainingRoutes).values({
				participantId: participant.id,
				points: updatedPoints,

				createdAt: new Date(),
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async deleteAllNotFinished(userId: string): Promise<CommonDto.BooleanResponse> {
		const createdTrainingsIds = (await this.getByStatus(userId, true, 'created')).map((t) => t.id);
		const activeTrainingsIds = (await this.getByStatus(userId, true, 'started')).map((t) => t.id);
		const trainingsIdsToDeletion = [...createdTrainingsIds, ...activeTrainingsIds];

		return await this.db.db.transaction(async (tx) => {
			for (const tid of trainingsIdsToDeletion) {
				const participants = await tx
					.select()
					.from(trainingParticipants)
					.where(eq(trainingParticipants.trainingId, tid));

				for (const participant of participants) {
					await tx.delete(trainingMetrics).where(eq(trainingMetrics.participantId, participant.id));
					await tx.delete(trainingRoutes).where(eq(trainingRoutes.participantId, participant.id));
				}

				await tx.delete(trainingParticipants).where(eq(trainingParticipants.trainingId, tid));
				await tx.delete(trainingInvites).where(eq(trainingInvites.trainingId, tid));

				await tx.delete(training).where(eq(training.id, tid));
				// Посты не чистим, тк у незавершенных тренировок не может быть постов
			}

			return { success: true };
		});
	}

	public async getFinished(userId: string, isCreator: boolean) {
		return this.getByStatus(userId, isCreator, 'finished');
	}

	public async getActive(userId: string, isCreator: boolean) {
		return this.getByStatus(userId, isCreator, 'started');
	}

	public async getCreated(userId: string, isCreator: boolean) {
		return this.getByStatus(userId, isCreator, 'created');
	}

	/** Получить все тренировки юзера по статусу. Никогда не выкидывает ошибку - только пустой массив */
	private async getByStatus(
		userId: string,
		isCreator: boolean,
		status: 'created' | 'started' | 'finished',
	): Promise<Required<TrainingDto.Entity>[]> {
		let startedAtFunc = isNull.bind(this);
		let finishedAtFunc = isNull.bind(this);

		switch (status) {
			case 'created': {
				startedAtFunc = isNull.bind(this);
				finishedAtFunc = isNull.bind(this);
				break;
			}
			case 'started': {
				startedAtFunc = isNotNull.bind(this);
				finishedAtFunc = isNull.bind(this);
				break;
			}
			case 'finished': {
				startedAtFunc = isNotNull.bind(this);
				finishedAtFunc = isNotNull.bind(this);
				break;
			}

			default:
				throw new Error('Bad status provided');
		}

		const query = this.db.db
			.select({
				id: training.id,
				type: training.type,
				creatorId: training.userCreatorId,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training);

		if (isCreator) {
			query.where(
				and(
					startedAtFunc(training.startedAt),
					finishedAtFunc(training.finishedAt),
					eq(training.userCreatorId, userId),
				),
			);
		} else {
			query.leftJoin(trainingParticipants, eq(trainingParticipants.trainingId, training.id));
			query.where(
				and(
					startedAtFunc(training.startedAt),
					finishedAtFunc(training.finishedAt),
					eq(trainingParticipants.userId, userId),
				),
			);
		}

		return await query;
	}

	public async getExtendedParticipants(trainingId: string): Promise<TrainingParticipantDto.ExtendedEntity[]> {
		const participants = await this.db.db
			.select({
				id: trainingParticipants.id,
				colorHex: trainingParticipants.colorHex,
				user: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
				route: {
					points: trainingRoutes.points,
					createdAt: trainingRoutes.createdAt,
					startedAt: trainingRoutes.startedAt,
					finishedAt: trainingRoutes.finishedAt,
				},
				metrics: {
					timeSec: trainingMetrics.timeSec,
					avgSpeedMPerSec: trainingMetrics.avgSpeedMPerSec,
					avgTempoSecondsPerKm: trainingMetrics.avgTempoSecondsPerKm,
					distanceM: trainingMetrics.distanceM,
					altitudeGainM: trainingMetrics.altitudeGainM,
					kkcal: trainingMetrics.kkcal,
				},
			})
			.from(trainingParticipants)
			.where(eq(trainingParticipants.trainingId, trainingId))
			.innerJoin(users, eq(users.id, trainingParticipants.userId))
			.leftJoin(trainingRoutes, eq(trainingRoutes.participantId, trainingParticipants.id))
			.leftJoin(trainingMetrics, eq(trainingMetrics.participantId, trainingParticipants.id));

		return participants;
	}

	public async getParticipants(
		trainingId: string,
		page: number,
		limit: number,
	): Promise<TrainingParticipantDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const participants = await this.db.db
			.select({
				id: trainingParticipants.id,
				user: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
				colorHex: trainingParticipants.colorHex,
			})
			.from(trainingParticipants)
			.where(eq(trainingParticipants.trainingId, trainingId))
			.innerJoin(users, eq(users.id, trainingParticipants.userId))
			.offset(offset)
			.limit(limit);

		return participants;
	}

	public async getParticipantsWithSubs(
		userId: string,
		trainingId: string,
		page: number,
		limit: number,
	): Promise<Required<TrainingParticipantDto.Entity>[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const participants = await this.db.db
			.select({
				id: trainingParticipants.id,
				user: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
				colorHex: trainingParticipants.colorHex,
				isSubscribed: sql<boolean>`${userSubscribers.userId} IS NOT NULL`,
			})
			.from(trainingParticipants)
			.where(eq(trainingParticipants.trainingId, trainingId))
			.innerJoin(users, eq(users.id, trainingParticipants.userId))
			.leftJoin(
				userSubscribers,
				and(
					eq(userSubscribers.userId, trainingParticipants.userId),
					eq(userSubscribers.userSubscriberId, userId),
				),
			)
			.offset(offset)
			.limit(limit);

		return participants;
	}

	public async getByIdAndParticipant(
		id: string,
		userId: string,
	): Promise<Required<TrainingDto.EntityWithCurrentParticipant>> {
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				type: training.type,
				creatorId: training.userCreatorId,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.where(eq(training.id, id))
			.limit(1);

		if (!trainingRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const [participant] = await this.db.db
			.select({
				id: trainingParticipants.id,
				user: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
				colorHex: trainingParticipants.colorHex,
			})
			.from(trainingParticipants)
			.innerJoin(users, eq(users.id, trainingParticipants.userId))
			.where(and(eq(trainingParticipants.trainingId, id), eq(trainingParticipants.userId, userId)))
			.limit(1);
		if (!participant) {
			throw new BadRequestException(ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT);
		}

		return {
			...trainingRow,
			participant,
		};
	}

	public async getAll(userId: string): Promise<TrainingDto.Entity[]> {
		const trainings = await this.db.db
			.select({
				id: training.id,
				type: training.type,
				creatorId: training.userCreatorId,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.leftJoin(trainingParticipants, eq(trainingParticipants.trainingId, training.id))
			.where(eq(trainingParticipants.userId, userId))
			.orderBy(desc(training.finishedAt, 'first'));

		return trainings;
	}

	public async getMy(
		userId: string,
		page: number,
		limit: number,
		isFinished?: boolean,
		types?: TrainingType[],
	): Promise<TrainingDto.HistoryEntity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const finishedCond =
			typeof isFinished !== 'undefined' ? (isFinished ? isNotNull : isNull)(training.finishedAt) : undefined;
		const typesCond = typeof types !== 'undefined' ? inArray(training.type, types) : undefined;

		const trainings = await this.db.db
			.select({
				id: training.id,
				type: training.type,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
				distanceM: trainingMetrics.distanceM,
			})
			.from(training)
			.innerJoin(trainingParticipants, eq(trainingParticipants.trainingId, training.id))
			.where(and(eq(trainingParticipants.userId, userId), finishedCond, typesCond))
			.leftJoin(trainingMetrics, eq(trainingMetrics.participantId, trainingParticipants.id))
			.orderBy(desc(training.finishedAt, 'first'))
			.offset(offset)
			.limit(limit);

		return trainings;
	}

	public async getById(id: string): Promise<Required<TrainingDto.Entity>> {
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				type: training.type,
				creatorId: training.userCreatorId,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.where(eq(training.id, id))
			.limit(1);

		if (!trainingRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return trainingRow;
	}

	public async getExtendedByIdAndParticipant(id: string, userId: string): Promise<TrainingDto.ExtendedEntity> {
		const extendedTraining = await this.getExtendedById(id);

		const userIsParticipant = !!extendedTraining.participants.find((p) => p.user.id === userId);
		if (!userIsParticipant) {
			throw new NotFoundException(ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT);
		}

		return extendedTraining;
	}

	public async getExtendedById(id: string): Promise<TrainingDto.ExtendedEntity> {
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				type: training.type,
				creatorId: training.userCreatorId,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,

				creator: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
			})
			.from(training)
			.innerJoin(users, eq(users.id, training.userCreatorId))
			.where(eq(training.id, id))
			.limit(1);

		if (!trainingRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const participants = await this.getExtendedParticipants(trainingRow.id);
		return { ...trainingRow, participants };
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async sendInvite(userCreatorId: string, toUserId: string): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				createdAt: training.createdAt,
				startedAt: training.startedAt,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.where(eq(training.userCreatorId, userCreatorId))
			.limit(1);
		// @TODO создавать треню если нету, проверять на наличие активной везде и тут!
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async leave(userParticipantId: string): Promise<any> {
		// @TODO проверка статуса трени
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async kickParticipant(userCreatorId: string, userParticipantId: string): Promise<any> {
		// @TODO проверка статуса трени
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async revokeInvite(userCreatorId: string, toUserId: string): Promise<any> {
		// @TODO проверка статуса трени
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async acceptInvite(invitedUserId: string, userCreatorId: string): Promise<any> {
		// @TODO проверка статуса трени, юзера что он уже не участник другой
		// @TODO  создать запись под метрики трени, роуты
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async rejectInvite(invitedUserId: string, userCreatorId: string): Promise<any> {}

	private calcMetrics(
		participant: TrainingParticipantDto.ExtendedEntity,
		type: TrainingType,
	): TrainingMetricsDto.Entity {
		let distanceM = 0;
		let maxAbsAltitudeM = 0;

		let pausedTimeMs = 0;
		let allTimeMs = 0;

		if (participant.route?.points && participant.route?.points?.length > 0) {
			for (let i = 0; i < participant.route.points.length; i++) {
				const point = participant.route.points[i];
				if (point.paused) {
					let prevPoint = point;
					if (i > 0) {
						prevPoint = participant.route.points[i - 1];
					}

					pausedTimeMs += point.rel_ts - prevPoint.rel_ts;
					continue;
				}

				maxAbsAltitudeM = Math.max(Math.abs(point.alt), maxAbsAltitudeM);
				distanceM += point.distance;
			}

			allTimeMs = participant.route.points[participant.route.points.length - 1].rel_ts;
		}

		const distanceKmh = round(distanceM / 1000, 2);

		const activeTimeMs = Math.max(allTimeMs - pausedTimeMs, 0);
		const timeSec = round(activeTimeMs / 1000);

		const avgTempoSecondsPerKm = distanceKmh === 0 ? 0 : round(timeSec / distanceKmh);
		const avgSpeedMPerSec = timeSec === 0 ? 0 : round(distanceM / timeSec);

		const altitudeGainM = round(maxAbsAltitudeM - (participant.route?.points?.at(0)?.alt ?? 0));
		const kkcal = calculateCalories(activeTimeMs, distanceM, type);

		return {
			timeSec: clampToPg(trainingMetrics.timeSec, timeSec),
			avgSpeedMPerSec: clampToPg(trainingMetrics.avgSpeedMPerSec, avgSpeedMPerSec),
			avgTempoSecondsPerKm: clampToPg(trainingMetrics.avgTempoSecondsPerKm, avgTempoSecondsPerKm),
			distanceM: clampToPg(trainingMetrics.distanceM, distanceM),
			altitudeGainM: clampToPg(trainingMetrics.altitudeGainM, altitudeGainM),
			kkcal: clampToPg(trainingMetrics.kkcal, kkcal),
		};
	}
}
