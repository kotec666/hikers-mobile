import { Module } from '@nestjs/common';
import { AchievementsContoller } from './achievements.controller';
import { DatabaseModule } from '../database/database.module';
import { AchievementsService } from './achievements.service';
import { UserModule } from '../user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
	controllers: [AchievementsContoller],
	imports: [DatabaseModule, UserModule, NotificationsModule],
	providers: [AchievementsService],
	exports: [AchievementsService],
})
export class AchievementsModule {}
