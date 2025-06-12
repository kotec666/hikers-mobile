import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Feedback } from './feedback.dto';
import { DatabaseService } from '../database/database.service';
import { feedback } from '../database/schema';
import { eq } from 'drizzle-orm';
import { ERRORS } from '@helpers/fieldError';

@Injectable()
export class FeedbackService {
	constructor(private readonly db: DatabaseService) {}

	async createFeedback(dto: Feedback.Request): Promise<Feedback.Response> {
		const [ext] = await this.db.db.select({ id: feedback.id }).from(feedback).where(eq(feedback.email, dto.email));
		if (ext) {
			throw new HttpException(ERRORS.ALREADY_CREATED, HttpStatus.BAD_REQUEST);
		}

		const [id] = await this.db.db.insert(feedback).values(dto).returning({ id: feedback.id });

		return { success: !!id };
	}
}
