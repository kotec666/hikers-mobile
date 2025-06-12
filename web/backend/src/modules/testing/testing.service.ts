import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { testing } from '../database/schema';
import { Logger } from 'nestjs-pino';
import { Testing } from './testing.dto';

@Injectable()
export class TestingService {
	constructor(
		private readonly db: DatabaseService,
		private readonly logger: Logger,
	) {}

	async createTestingLog(text: string): Promise<Testing.Entity> {
		this.logger.log(`Recieved data: ${text}`);

		const [log] = await this.db.db
			.insert(testing)
			.values({ text })
			.returning({ id: testing.id, text: testing.text, createdAt: testing.createdAt });
		return log;
	}

	async getAllTestingLogs(): Promise<Testing.Entity[]> {
		const logs = await this.db.db
			.select({ id: testing.id, text: testing.text, createdAt: testing.createdAt })
			.from(testing);

		return logs;
	}

	async deleteAllTestingLogs(): Promise<Testing.StatusResponse> {
		await this.db.db.delete(testing);
		return { success: true };
	}
}
