import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AchievementDto } from './achievements.dto';
import { achievements, userAchievements } from '../database/schema';
import { eq, notInArray, sql } from 'drizzle-orm';

@Injectable()
export class AchievementsService {
	constructor(private readonly db: DatabaseService) {}

	public async getAll(): Promise<AchievementDto.Entity[]> {
		// @TODO пагинация

		return await this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				claimedAt: userAchievements.createdAt,
			})
			.from(achievements)
			.leftJoin(userAchievements, eq(userAchievements.achievementId, achievements.id));
	}

	public async getById(id: string): Promise<AchievementDto.Entity> {
		const [achievement] = await this.db.db
			.select({
				id: achievements.id,
				iconFilename: achievements.iconFilename,
				colorHex: achievements.colorHex,
				title: achievements.title,
				description: achievements.description,
				claimedPercent: achievements.claimedPercent,
				claimedAt: userAchievements.createdAt,
			})
			.from(achievements)
			.where(eq(achievements.id, id))
			.leftJoin(userAchievements, eq(userAchievements.achievementId, achievements.id))
			.limit(1);

		if (!achievement) {
			throw new NotFoundException('Achievement not found');
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
				claimedAt: userAchievements.createdAt,
			})
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId))
			.rightJoin(achievements, eq(achievements.id, userAchievements.achievementId));
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
				claimedAt: sql<null>`NULL`,
			})
			.from(achievements)
			.where(notInArray(achievements.id, claimedIds));
	}
}
