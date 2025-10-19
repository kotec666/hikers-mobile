import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [ActivitiesController],
	exports: [ActivitiesService],
	imports: [DatabaseModule],
	providers: [ActivitiesService],
})
export class ActivitiesModule {}
