import { BadRequestException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
	training,
	trainingInvites,
	trainingMetrics,
	trainingParticipants,
	TrainingRouteNode,
	trainingRoutes,
	trainingTypes,
	users,
} from '../database/schema';
import { TrainingDto, TrainingParticipantDto } from './trainings.dto';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

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

		const upsertQuery = {
			type: dto.type,
			userCreatorId: userId,
			startedAt: dto.now ? new Date() : undefined,
		};
		const returningQuery = {
			id: training.id,
			type: training.type,
			createdAt: training.createdAt,
			startedAt: training.startedAt,
			finishedAt: training.finishedAt,
		};

		// Созданная тренировка может быть только в единственном экземпляре.
		const [createdTraining] = await this.getCreated(userId, false);

		// При этом - если юзер не создатель этой трени, то обновить её он не может
		if (createdTraining && createdTraining.creatorId !== userId) {
			throw new BadRequestException(ERRORS.USER_IN_NOT_FINISHED_TRAINING);
		}

		// Обновляем существующюю или создаем новую
		// (просто удалить существующюю нельзя - т.к. на ней могут висеть инвайты)
		const [trainingRow] = createdTraining
			? await this.db.db
					.update(training)
					.set(upsertQuery)
					.where(eq(training.id, createdTraining.id))
					.returning(returningQuery)
			: await this.db.db.insert(training).values(upsertQuery).returning(returningQuery);

		return trainingRow;

		// @TODO асинхронно, без ожидания
		// создать записи под метрики трени, роуты для всех участников
	}

	public async sync(userId: string, dto: TrainingDto.Sync): Promise<any> {
		// @TODO в будущем проверить проблему - если синхра с фронта придет быстрее, чем в обработается предыдущяя
		const training = await this.getByIdAndParticipant(dto.id, userId);

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

		await this.updateRoute(training.participant, dto.metrics);
	}

	private async updateRoute(participant: TrainingParticipantDto.Entity, metrics: TrainingRouteNode[]): Promise<void> {
		const [trainingRoute] = await this.db.db
			.select({
				id: trainingRoutes.id,
				points: trainingRoutes.points,
			})
			.from(trainingRoutes)
			.innerJoin(trainingParticipants, eq(trainingParticipants.userId, participant.user.id))
			.where(eq(trainingRoutes.participantId, trainingParticipants.id))
			.limit(1);

		if (trainingRoute) {
			const updatedPoints = (trainingRoute.points || []).concat(metrics);

			await this.db.db
				.update(trainingRoutes)
				.set({
					points: updatedPoints,
				})
				.where(eq(trainingRoutes.id, trainingRoute.id));
		} else {
			await this.db.db.insert(trainingRoutes).values({
				participantId: participant.id,
				points: metrics,

				createdAt: new Date(),
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async finish(userId: string, id: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async deleteAllNotFinished(userId: string): Promise<any> {
		const createdTrainingsIds = (await this.getByStatus(userId, true, 'created')).map((t) => t.id);
		const activeTrainingsIds = (await this.getByStatus(userId, true, 'started')).map((t) => t.id);
		const trainingsIdsToDeletion = [...createdTrainingsIds, ...activeTrainingsIds];

		await this.db.db.transaction(async (tx) => {
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

	public async getParticipants(trainingId: string): Promise<TrainingParticipantDto.Entity[]> {
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
			.innerJoin(users, eq(users.id, trainingParticipants.userId));

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

	public async getExtendedById(id: string): Promise<TrainingDto.ExtendedEntity> {
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
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
				type: {
					name: trainingTypes.name,
					measuringUnit: trainingTypes.measuringUnit,
					iconFilename: trainingTypes.iconFilename,
				},
			})
			.from(training)
			.innerJoin(users, eq(users.id, training.userCreatorId))
			.innerJoin(trainingTypes, eq(trainingTypes.name, training.type))
			.where(eq(training.id, id))
			.limit(1);

		if (!trainingRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const participants = await this.getParticipants(trainingRow.id);
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
	public async leave(userParticipantId: string): Promise<any> {}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async kickParticipant(userCreatorId: string, userParticipantId: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async revokeInvite(userCreatorId: string, toUserId: string): Promise<any> {}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async acceptInvite(invitedUserId: string, userCreatorId: string): Promise<any> {
		// @TODO асинхронно, без ожидания
		// создать запись под метрики трени, роуты
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async revectInvite(invitedUserId: string, userCreatorId: string): Promise<any> {}
}
