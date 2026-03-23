import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AchievementDto } from './achievements.dto';
import { achievements, training, trainingMetrics, trainingParticipants, userAchievements } from '../database/schema';
import { eq, notInArray, sql, and } from 'drizzle-orm';
import { asc, desc } from '../database/extensions';
import { NotificationsService } from '../notifications/notifications.service';
import { CommonDto } from 'src/common/dto/common.dto';
import { ERRORS } from '@shared/errors';
import { NotificationType } from '@shared/enums';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from '@events/constants';

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

		// @TODO доделать после сидера
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const participant of participants) {
			// 	const activity = getActivityByTrainingType(participant.type);
			// 	if (!activity) continue;
			// 	let goalToAdd = 0;
			// 	switch (activity) {
			// 		case UserActivity.STEPS: {
			// 			// Считать шаги пока не умеем, можно по жопной формуле от дистанции канешн
			// 			continue;
			// 		}
			// 		case UserActivity.BICYCLE: {
			// 			goalToAdd = Math.trunc(participant.metrics.distanceM / 1000);
			// 			break;
			// 		}
			// 		case UserActivity.RUN: {
			// 			goalToAdd = Math.trunc(participant.metrics.distanceM / 1000);
			// 			break;
			// 		}
			// 		case UserActivity.TRACK: {
			// 			goalToAdd = Math.trunc(participant.metrics.distanceM / 1000);
			// 			break;
			// 		}
			// 		default: {
			// 			continue;
			// 		}
			// 	}
			// 	await this.addProgress(participant.userId, activity, goalToAdd);
		}
	}

	public async addProgress(
		userId: string,
		achievementId: string,
		progress: number,
	): Promise<CommonDto.BooleanResponse> {
		const [achieve] = await this.db.db
			.select({
				progress: userAchievements.progress,
				claimedAt: userAchievements.claimedAt,
			})
			.from(userAchievements)
			.where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
		if (!achieve) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const newProgress = Math.min(100, achieve.progress + progress);
		return this.setProgress(userId, achievementId, newProgress);
	}

	public async setProgress(
		userId: string,
		achievementId: string,
		newProgress: number,
	): Promise<CommonDto.BooleanResponse> {
		newProgress = Math.max(Math.min(newProgress, 100), 0);

		if (newProgress >= 100) {
			return this.giveAchievement(userId, achievementId);
		}

		await this.db.db
			.insert(userAchievements)
			.values({
				userId,
				achievementId,
				progress: newProgress,
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: { progress: newProgress },
			});

		return { success: true };
	}

	public async giveAchievement(
		userId: string,
		achievementId: string,
		progress?: number,
	): Promise<CommonDto.BooleanResponse> {
		await this.db.db
			.insert(userAchievements)
			.values({
				userId,
				achievementId,
				claimedAt: sql`NOW()`,
				progress: progress ?? 100,
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: { progress: 100, claimedAt: sql`NOW()` },
			});

		this.notifications
			.create(userId, {
				type: NotificationType.ACHIEVEMENT,
				relEntityId: achievementId,
			})
			.catch((r) => {
				console.log('New achievement notification creation failed', r);
			});

		return { success: true };
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
				progress: userAchievements.progress,
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
				progress: userAchievements.progress,
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
		// @TODO подвязать систему друзей. Аля: есть у Васи, Коли, Пети

		const query = this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				progress: userAchievements.progress,
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
		// @TODO подвязать систему друзей. Аля: есть у Васи, Коли, Пети
		const claimedIds = (await this.getClaimed(userId)).map((achv) => achv.id);

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
			.where(notInArray(achievements.id, claimedIds));
	}
}
