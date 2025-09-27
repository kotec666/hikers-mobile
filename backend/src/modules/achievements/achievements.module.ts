import { Module } from '@nestjs/common';
import { AchievementsContoller } from './achievements.contoller';
import { DatabaseModule } from '../database/database.module';
import { AchievementsService } from './achievements.service';

@Module({
	controllers: [AchievementsContoller],
	imports: [DatabaseModule],
	providers: [AchievementsService],
	exports: [],
})
export class AchievementsModule {}
