import { Injectable } from '@nestjs/common';
import { ProfileDto } from './profile.dto';
import { UserService } from '../user/user.service';
import { SubscribersService } from '../subscribers/subscribers.service';
import { FriendsService } from '../friends/friends.service';
import { AchievementsService } from '../achievements/achievements.service';
import { ActivitiesService } from '../activities/activities.service';

const PROFILE_TOP_ACTIVITIES_COUNT = 3;

@Injectable()
export class ProfileService {
	constructor(
		private readonly users: UserService,
		private readonly subs: SubscribersService,
		private readonly friends: FriendsService,
		private readonly achievements: AchievementsService,
		private readonly activities: ActivitiesService,
	) {}

	public async getMe(userId: string): Promise<ProfileDto.Entity> {
		const user = await this.users.getUser(userId);

		const subscribers = await this.subs.getSubscribers(userId);
		const subscribtions = await this.subs.getSubscribtions(userId);

		const friends = await this.friends.getFriends(userId);

		const achievements = await this.achievements.getClaimed(userId);
		const activities = await this.activities.getAll(userId, PROFILE_TOP_ACTIVITIES_COUNT);
		const posts = [];

		return {
			user,
			subscribers,
			subscribtions,
			friends,
			achievements,
			activities,
			posts,
		};
	}
}
