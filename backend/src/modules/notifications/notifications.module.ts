import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [],
	exports: [],
	imports: [DatabaseModule],
	providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
