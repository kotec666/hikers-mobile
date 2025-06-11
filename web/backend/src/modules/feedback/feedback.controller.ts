import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody } from '@nestia/core';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.dto';

@Controller('feedback')
export class FeedbackController {
	constructor(private readonly service: FeedbackService) {}

	/**
	 * @tag Feedback
	 * @summary Leave a feedback
	 */
	@TypedRoute.Post()
	async addFeedback(@TypedBody() dto: Feedback.Request) {
		return this.service.createFeedback(dto);
	}
}
