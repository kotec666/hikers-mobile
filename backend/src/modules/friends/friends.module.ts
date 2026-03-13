import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
	imports: [DatabaseModule, UserModule, NotificationsModule],
})
export class FriendsModule {}
