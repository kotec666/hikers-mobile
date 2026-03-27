import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AchievementDto } from './achievements.dto';
import { achievements, training, trainingMetrics, trainingParticipants, userAchievements } from '../database/schema';
import { eq, sql, and, isNotNull, isNull } from 'drizzle-orm';
import { asc, desc } from '../database/extensions';
import { NotificationsService } from '../notifications/notifications.service';
import { CommonDto } from 'src/common/dto/common.dto';
import { ERRORS } from '@shared/errors';
import { MeasuringUnit, NotificationType, TrainingType, UserActivity } from '@shared/enums';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from '@events/constants';
import { getActivityByTrainingType } from '../activities/helpers';

@Injectable()
export class AchievementsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly notifications: NotificationsService,
	) {}

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

		if (participants.length === 0) {
			return;
		}

		const trainingType = participants[0].type;
		const activities = new Set<UserActivity>();
		if (
			trainingType === TrainingType.RUN ||
			trainingType === TrainingType.TRACK ||
			trainingType === TrainingType.WALK
		) {
			activities.add(UserActivity.STEPS);
		}

		const activity = getActivityByTrainingType(trainingType);
		if (activity) {
			activities.add(activity);
		}

		for (const activity of activities.values()) {
			// Получаем все ачивки, у которых type как у активности из трени
			const achivs = await this.db.db
				.select()
				.from(achievements)
				.where(and(eq(achievements.type, activity), isNotNull(achievements.measuringUnit)));

			for (const achieve of achivs) {
				const unit = achieve.measuringUnit!;

				// Для каждого из участников - накидываем прогресса по ачивке
				Promise.all(
					participants.map(async (participant) => {
						let progressToAdd = 0;

						switch (activity) {
							case UserActivity.STEPS: {
								if (unit === MeasuringUnit.COUNT) {
									const AVERAGE_STRIDE_LENGTH = 0.75;

									if (participant.metrics.distanceM) {
										progressToAdd = Math.trunc(
											participant.metrics.distanceM / AVERAGE_STRIDE_LENGTH,
										);
									}
								}

								break;
							}

							case UserActivity.RUN:
							case UserActivity.TRACK:
							case UserActivity.BICYCLE: {
								if (unit === MeasuringUnit.KILOMETER) {
									progressToAdd = Math.trunc(participant.metrics.distanceM / 1000);
								} else if (unit === MeasuringUnit.METER) {
									progressToAdd = Math.trunc(participant.metrics.distanceM);
								}
								break;
							}

							default: {
								return participant;
							}
						}

						await this.addProgress(participant.userId, achieve.id, progressToAdd);
						return participant;
					}),
				).catch((reason) => {
					console.error('Failed to add achievements progress. Reason:', reason);
				});
			}
		}
	}

	public async addProgress(
		userId: string,
		achievementId: string,
		progress: number,
	): Promise<CommonDto.BooleanResponse> {
		const [userAchieve] = await this.db.db
			.select({
				progress: userAchievements.progress,
			})
			.from(userAchievements)
			.where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));

		const newProgress = (userAchieve ? userAchieve.progress : 0) + progress;
		return this.setProgress(userId, achievementId, newProgress);
	}

	public async setProgress(
		userId: string,
		achievementId: string,
		newProgress: number,
	): Promise<CommonDto.BooleanResponse> {
		const [achieve] = await this.db.db
			.select({ targetProgress: achievements.targetProgress })
			.from(achievements)
			.where(eq(achievements.id, achievementId))
			.limit(1);
		if (!achieve) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const isDone = achieve.targetProgress <= newProgress;
		await this.db.db
			.insert(userAchievements)
			.values({
				userId,
				achievementId,
				progress: newProgress,
				claimedAt: isDone ? sql`NOW()` : null,
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: { progress: newProgress, claimedAt: isDone ? sql`NOW()` : undefined },
			});

		if (isDone) {
			this.notifyAchievementDone(userId, achievementId);
		}

		return { success: true };
	}

	public async giveAchievement(
		userId: string,
		achievementId: string,
		progress?: number,
	): Promise<CommonDto.BooleanResponse> {
		const [achieve] = await this.db.db
			.select({ targetProgress: achievements.targetProgress })
			.from(achievements)
			.where(eq(achievements.id, achievementId))
			.limit(1);

		if (!achieve) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const targetProgress = progress ?? achieve.targetProgress;

		await this.db.db
			.insert(userAchievements)
			.values({
				userId,
				achievementId,
				claimedAt: sql`NOW()`,
				progress: targetProgress,
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: { progress: targetProgress, claimedAt: sql`NOW()` },
			});

		this.notifyAchievementDone(userId, achievementId);

		return { success: true };
	}

	private notifyAchievementDone(userId: string, achievementId: string) {
		this.notifications
			.create(userId, {
				type: NotificationType.ACHIEVEMENT,
				relEntityId: achievementId,
			})
			.catch((r) => {
				console.log('New achievement notification creation failed', r);
			});
	}

	/** Обновление расстановки мест ачивок. Ближе к началу списка - выше в топе, остальные ачивки обнуляют место */
	public async updatePlaces(userId: string, ids: string[]): Promise<CommonDto.BooleanResponse> {
		// Сначала сбрасываем все другие места в топе
		await this.db.db
			.update(userAchievements)
			.set({
				placeForShow: null,
			})
			.where(eq(userAchievements.userId, userId));

		// Потом перезаписываем места в топе
		let place = 1;
		for (const id of ids) {
			const [exists] = await this.db.db
				.update(userAchievements)
				.set({
					placeForShow: place,
				})
				.where(and(eq(userAchievements.achievementId, id), eq(userAchievements.userId, userId)))
				.returning({ achievementId: userAchievements.achievementId });

			// Не инкрементируем если ачивки у юзера нет
			if (exists) place++;
		}

		return { success: true };
	}

	public async getAll(userId: string): Promise<AchievementDto.Entity[]> {
		return await this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				// clamp-им в [0, 100] %
				progress: sql<number>`GREATEST(0, LEAST(100, 100 * COALESCE(${userAchievements.progress}, 0) / ${achievements.targetProgress}))`,
				place: userAchievements.placeForShow,
				claimedAt: userAchievements.claimedAt,
			})
			.from(achievements)
			.leftJoin(
				userAchievements,
				and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)),
			);
	}

	public async getById(id: string, userId: string): Promise<AchievementDto.Entity> {
		const [achievement] = await this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				// clamp-им в [0, 100] %
				progress: sql<number>`GREATEST(0, LEAST(100, 100 * COALESCE(${userAchievements.progress}, 0) / ${achievements.targetProgress}))`,
				place: userAchievements.placeForShow,
				claimedAt: userAchievements.claimedAt,
			})
			.from(achievements)
			.where(eq(achievements.id, id))
			.leftJoin(
				userAchievements,
				and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)),
			)
			.limit(1);

		if (!achievement) {
			throw new NotFoundException();
		}

		return achievement;
	}

	public async getClaimed(userId: string, limit?: number): Promise<AchievementDto.Entity[]> {
		const query = this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				// clamp-им в [0, 100] %
				progress: sql<number>`GREATEST(0, LEAST(100, 100 * COALESCE(${userAchievements.progress}, 0) / ${achievements.targetProgress}))`,
				place: userAchievements.placeForShow,
				claimedAt: userAchievements.claimedAt,
			})
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId))
			.innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
			.$dynamic();

		if (typeof limit === 'number') {
			query.limit(limit).orderBy(asc(userAchievements.placeForShow, 'last'));
		} else {
			query.orderBy(desc(userAchievements.claimedAt, 'last'));
		}

		return query;
	}

	public async getUnclaimed(userId: string): Promise<AchievementDto.Entity[]> {
		return await this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				progress: sql<null>`NULL`,
				place: sql<null>`NULL`,
				claimedAt: sql<null>`NULL`,
			})
			.from(achievements)
			.leftJoin(
				userAchievements,
				and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)),
			)
			.where(isNull(userAchievements));
	}
}
