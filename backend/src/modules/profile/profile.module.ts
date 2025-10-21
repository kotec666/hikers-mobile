import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserModule } from '../user/user.module';
import { SubscribersModule } from '../subscribers/subscribers.module';
import { FriendsModule } from '../friends/friends.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
	controllers: [ProfileController],
	exports: [],
	imports: [UserModule, SubscribersModule, FriendsModule, AchievementsModule, ActivitiesModule],
	providers: [ProfileService],
})
export class ProfileModule {}
