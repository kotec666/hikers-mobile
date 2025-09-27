import { Module } from '@nestjs/common';
import { AchievementsContoller } from './achievements.contoller';
import { DatabaseModule } from '../database/database.module';
import { AchievementsService } from './achievements.service';
import { UserModule } from '../user/user.module';

@Module({
	controllers: [AchievementsContoller],
	imports: [DatabaseModule, UserModule],
	providers: [AchievementsService],
	exports: [],
})
export class AchievementsModule {}
