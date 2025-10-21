import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AchievementDto } from './achievements.dto';
import { achievements, userAchievements } from '../database/schema';
import { eq, notInArray, sql, and } from 'drizzle-orm';

@Injectable()
export class AchievementsService {
	constructor(private readonly db: DatabaseService) {}

	public async getAll(userId: string): Promise<AchievementDto.Entity[]> {
		// @TODO пагинация

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

	public async getClaimed(userId: string): Promise<AchievementDto.Entity[]> {
		// @TODO подвязать систему друзей. Аля: есть у Васи, Коли, Пети

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
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId))
			.innerJoin(achievements, eq(achievements.id, userAchievements.achievementId));
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
