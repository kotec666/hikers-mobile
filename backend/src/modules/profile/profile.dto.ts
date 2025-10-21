import { AchievementDto } from '../achievements/achievements.dto';
import { ActivitiyDto } from '../activities/activities.dto';
import { FriendDto } from '../friends/friends.dto';
import { SubscriberDto, SubscribtionDto } from '../subscribers/subscribers.dto';
import { UserDto } from '../user/user.dto';

export namespace ProfileDto {
	export type Entity = {
		user: UserDto.Entity;
		subscribers: SubscriberDto.Entity[];
		subscribtions: SubscribtionDto.Entity[];
		friends: FriendDto.Entity[];
		achievements: AchievementDto.Entity[];
		activities: ActivitiyDto.Entity[];
		posts: any[]; // @TODO
	};
}
