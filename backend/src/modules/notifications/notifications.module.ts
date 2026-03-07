import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../database/database.module';
import { NotificationsController } from './notifications.controller';

@Module({
	controllers: [NotificationsController],
	exports: [],
	imports: [DatabaseModule],
	providers: [NotificationsService],
})
export class NotificationsModule {}
