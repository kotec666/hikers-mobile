import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()
  async addFeedback(@Body() dto: Feedback.Request) {
    return this.service.createFeedback(dto);
  }
}
