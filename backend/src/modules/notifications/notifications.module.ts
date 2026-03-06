import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
	controllers: [],
	exports: [],
	imports: [],
	providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
