import { IsOptional, Length } from 'class-validator';
import { AchievementDto } from '../achievements/achievements.dto';
import { ActivitiyDto } from '../activities/activities.dto';
import { FriendDto } from '../friends/friends.dto';
import { SubscriberDto, SubscribtionDto } from '../subscribers/subscribers.dto';
import { UserDto } from '../user/user.dto';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';

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

	export class Edit {
		@IsOptional()
		@Length(lengths.user.username.min, lengths.user.username.max, { message: `_username:${ERRORS.INVALID_LENGTH}` })
		username?: string;

		@IsOptional()
		@Length(lengths.user.name.min, lengths.user.name.max, { message: `_name:${ERRORS.INVALID_LENGTH}` })
		name?: string;

		@IsOptional()
		avatar?: Express.Multer.File | null;

		@IsOptional()
		activities?: string; //UserActivity[];

		@IsOptional()
		achievements?: string; //string[];
	}
}
