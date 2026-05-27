import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { and, eq, sql } from 'drizzle-orm';
import { MeasuringUnit, TrainingType, UserActivity } from '@shared/enums';
import { AVERAGE_STRIDE_LENGTH } from '@shared/constants';
import { ERRORS } from '@shared/errors';
import { Event } from '@events/constants';
import { getActivityByTrainingType, getDefaultMeasuringUnitByActivity } from './helpers';
import { training, trainingMetrics, trainingParticipants, userActivities } from '../database/schema';
import { DatabaseService } from '../database/database.service';
import { asc } from '../database/extensions';
import { CommonDto } from '../../common/dto/common.dto';
import { ActivitiyDto } from './activities.dto';

@Injectable()
export class ActivitiesService {
	constructor(private readonly db: DatabaseService) {}

	@OnEvent(Event.USER_CREATED)
	private async handleUserCreated(id: string) {
		this.upsertAllActivities(id).catch((reason) => {
			console.error(`Failed to upsert activities for user ${id}:`, reason);
		});
	}

	@OnEvent(Event.TRAINING_FINISHED)
	private async handleTrainingFinished(id: string) {
		const participants = await this.db.db
			.select({
				type: training.type,
				userId: trainingParticipants.userId,
				metrics: {
					timeSec: trainingMetrics.timeSec,
					avgSpeedMPerSec: trainingMetrics.avgSpeedMPerSec,
					avgTempoSecondsPerKm: trainingMetrics.avgTempoSecondsPerKm,
					distanceM: trainingMetrics.distanceM,
					altitudeGainM: trainingMetrics.altitudeGainM,
					kkcal: trainingMetrics.kkcal,
				},
			})
			.from(training)
			.where(eq(training.id, id))
			.innerJoin(trainingParticipants, eq(trainingParticipants.trainingId, id))
			// Inner, поскольку участники без метрик нас не интересуют
			.innerJoin(trainingMetrics, eq(trainingMetrics.participantId, trainingParticipants.id));

		for (const participant of participants) {
			const activities = new Set<UserActivity>();
			if (
				participant.type === TrainingType.RUN ||
				participant.type === TrainingType.TRACK ||
				participant.type === TrainingType.WALK
			) {
				activities.add(UserActivity.STEPS);
			}
			if (participant.type === TrainingType.WALK) {
				activities.add(UserActivity.TRACK);
			}

			const activity = getActivityByTrainingType(participant.type);
			if (!activity) continue;
			activities.add(activity);

			for (const activity of activities.values()) {
				let goalToAdd = 0;
				const unit = getDefaultMeasuringUnitByActivity(activity);

				switch (activity) {
					case UserActivity.STEPS: {
						if (unit === MeasuringUnit.COUNT) {
							if (participant.metrics.distanceM) {
								goalToAdd = Math.trunc(participant.metrics.distanceM / AVERAGE_STRIDE_LENGTH);
							}
						}

						break;
					}

					case UserActivity.RUN:
					case UserActivity.TRACK:
					case UserActivity.BICYCLE: {
						if (unit === MeasuringUnit.KILOMETER) {
							goalToAdd = Math.trunc(participant.metrics.distanceM / 1000);
						} else if (unit === MeasuringUnit.METER) {
							goalToAdd = Math.trunc(participant.metrics.distanceM);
						}
						break;
					}

					default: {
						continue;
					}
				}

				await this.addGoalProgress(participant.userId, activity, goalToAdd);
			}
		}
	}

	/** Обновление расстановки мест активностей. Ближе к началу списка - выше в топе, остальные активности обнуляют место */
	public async updatePlaces(userId: string, names: UserActivity[]): Promise<void> {
		// Сначала сбрасываем все другие места в топе
		await this.db.db
			.update(userActivities)
			.set({
				placeForShow: null,
			})
			.where(eq(userActivities.userId, userId));

		// Потом перезаписываем места в топе
		let place = 1;
		for (const name of names) {
			const [exists] = await this.db.db
				.update(userActivities)
				.set({
					placeForShow: place,
				})
				.where(and(eq(userActivities.name, name), eq(userActivities.userId, userId)))
				.returning({ name: userActivities.name });

			// Не инкрементируем если ачивки у юзера нет
			if (exists) place++;
		}
	}

	public async getAll(userId: string, limit?: number): Promise<ActivitiyDto.Entity[]> {
		const query = this.db.db
			.select({
				place: userActivities.placeForShow,
				goal: userActivities.goal,
				name: userActivities.name,
				measuringUnit: userActivities.measuringUnit,
			})
			.from(userActivities)
			.where(eq(userActivities.userId, userId))
			.$dynamic();

		if (typeof limit === 'number') {
			query.limit(limit).orderBy(asc(userActivities.placeForShow, 'last'));
		}

		return query;
	}

	public async getByType(userId: string, type: UserActivity): Promise<ActivitiyDto.Entity> {
		const [act] = await this.db.db
			.select({
				place: userActivities.placeForShow,
				goal: userActivities.goal,
				name: userActivities.name,
				measuringUnit: userActivities.measuringUnit,
			})
			.from(userActivities)
			.where(and(eq(userActivities.userId, userId), eq(userActivities.name, type)))
			.limit(1);
		if (!act) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return act;
	}

	public async addGoalProgress(
		userId: string,
		name: UserActivity,
		progressToAdd: number,
	): Promise<CommonDto.BooleanResponse> {
		if (progressToAdd <= 0) {
			return { success: false };
		}

		await this.db.db
			.insert(userActivities)
			.values({
				userId,
				goal: Math.trunc(progressToAdd),
				name: name,
				measuringUnit: getDefaultMeasuringUnitByActivity(name),
			})
			.onConflictDoUpdate({
				set: {
					goal: sql`${userActivities.goal} + ${progressToAdd}`,
				},
				target: [userActivities.userId, userActivities.name],
			});

		return { success: true };
	}

	public async upsertAllActivities(userId: string): Promise<ActivitiyDto.Entity[]> {
		return this.db.db.transaction(async (tx) => {
			return Promise.all(
				Object.values(UserActivity).map(async (name) => {
					const [act] = await tx
						.insert(userActivities)
						.values({
							userId,
							goal: 0,
							name: name,
							measuringUnit: getDefaultMeasuringUnitByActivity(name),
						})
						.onConflictDoNothing()
						.returning({
							place: userActivities.placeForShow,
							goal: userActivities.goal,
							name: userActivities.name,
							measuringUnit: userActivities.measuringUnit,
						});

					return act;
				}),
			);
		});
	}
}
