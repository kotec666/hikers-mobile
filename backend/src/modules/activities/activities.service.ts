import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ActivitiyDto } from './activities.dto';
import { trainingTypes, userActivities } from '../database/schema';
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
				trainingType: {
					name: trainingTypes.name,
					measuringUnit: trainingTypes.measuringUnit,
					iconFilename: trainingTypes.iconFilename,
				},
			})
			.from(userActivities)
			.innerJoin(trainingTypes, eq(trainingTypes.name, userActivities.type))
			.where(eq(userActivities.userId, userId));

		if (typeof limit === 'number') {
			query.limit(limit).orderBy(asc(userActivities.placeForShow));
		}

		return query;
	}
}
