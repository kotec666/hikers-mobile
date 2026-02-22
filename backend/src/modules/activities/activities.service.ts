import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivitiyDto } from './activities.dto';
import { userActivities } from '../database/schema';
import { and, eq } from 'drizzle-orm';
import { UserActivity } from '@shared/enums';
import { asc } from '../database/extensions';

@Injectable()
export class ActivitiesService {
	constructor(private readonly db: DatabaseService) {}

	// @TODO создание своих активностей?
	// public async create(userId: string) {}

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
}
