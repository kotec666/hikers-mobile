import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { achievementsSeedData } from '../achievements/achievements.seed';
import * as schema from './schema';
import { config } from 'dotenv';

config({ quiet: true });

async function seedAchievements(db: NodePgDatabase) {
	return db.transaction(async (tx) => {
		return Promise.all(
			achievementsSeedData.map(async (achievement) => {
				await tx
					.insert(schema.achievements)
					.values({
						type: achievement.type,
						measuringUnit: achievement.measuringUnit,
						targetProgress: achievement.targetProgress,
						colorHex: achievement.colorHex,
						title: achievement.title,
						iconFilename: null,
						description: achievement.description || null,
					})
					.onConflictDoNothing();
			}),
		);
	});
}

async function main() {
	const db = drizzle(process.env.DATABASE_URL!);
	seedAchievements(db);
}

main();
