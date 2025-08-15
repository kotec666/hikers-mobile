import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { DatabaseModule } from '../database/database.module';
import { FeedbackController } from './feedback.controller';

@Module({
	controllers: [FeedbackController],
	imports: [DatabaseModule],
	providers: [FeedbackService],
	exports: [FeedbackService],
})
export class FeedbackModule {}
