import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
	imports: [DatabaseModule, UserModule],
})
export class FriendsModule {}
