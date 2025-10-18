import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivitiyDto } from './activities.dto';
import { userActivities } from '../database/schema';
import { asc, eq } from 'drizzle-orm';

@Injectable()
export class ActivitiesService {
	constructor(private readonly db: DatabaseService) {}

	// @TODO создание своих активностей?
	// public async create(userId: string) {}
	// public async setPlaceForShow(userId: string, trainingTypeId: string) {}

	public async getAll(userId: string, limit?: number): Promise<ActivitiyDto.Entity[]> {
		// @TODO пагинация?
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
			query.limit(limit).orderBy(asc(userActivities.placeForShow));
		}

		return query;
	}
}
