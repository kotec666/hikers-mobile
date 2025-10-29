import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfileDto } from './profile.dto';
import { UserService } from '../user/user.service';
import { SubscribersService } from '../subscribers/subscribers.service';
import { FriendsService } from '../friends/friends.service';
import { AchievementsService } from '../achievements/achievements.service';
import { ActivitiesService } from '../activities/activities.service';
import { StaticService } from '../static/static.service';
import { UserDto } from '../user/user.dto';

const PROFILE_TOP_ACTIVITIES_COUNT = 3;
const PROFILE_TOP_ACHIEVEMENTS_COUNT = 3;

@Injectable()
export class ProfileService {
	constructor(
		private readonly users: UserService,
		private readonly subs: SubscribersService,
		private readonly friends: FriendsService,
		private readonly achievements: AchievementsService,
		private readonly activities: ActivitiesService,
		private readonly files: StaticService,
	) {}

	public async getMe(userId: string): Promise<ProfileDto.Entity> {
		const user = await this.users.getUser(userId);

		const subscribers = await this.subs.getSubscribersCount(userId);
		const subscriptions = await this.subs.getSubscriptionsCount(userId);

		const friends = await this.friends.getFriendsCount(userId);

		const achievements = await this.achievements.getClaimed(userId, PROFILE_TOP_ACHIEVEMENTS_COUNT);
		const activities = await this.activities.getAll(userId, PROFILE_TOP_ACTIVITIES_COUNT);
		const posts = [];

		return {
			user,
			subscribers,
			subscriptions,
			friends,
			achievements,
			activities,
			posts,
		};
	}

	public async edit(userId: string, dto: ProfileDto.Edit): Promise<ProfileDto.Entity> {
		dto = Object.fromEntries(Object.entries(dto).filter(([, val]) => typeof val !== 'undefined'));

		if (Object.values(dto).length === 0) {
			throw new BadRequestException();
		}

		const user = await this.users.getUser(userId);
		const userDto: Partial<UserDto.Entity> = {
			name: dto.name,
			username: dto.username,
		};

		if (typeof dto.avatarFilename !== 'string') {
			// Не храним историю аватаров
			if (user.avatarFilename) {
				await this.files.deleteFile(user.avatarFilename);
				userDto.avatarFilename = null;
			}

			if (dto.avatarFilename) {
				userDto.avatarFilename = await this.files.uploadFile(dto.avatarFilename);
			}
		}

		if (Object.values(userDto).filter((val) => !!val).length > 0) {
			await this.users.updateUser(userId, userDto);
		}

		if (dto.achievements) {
			await this.achievements.updatePlaces(userId, dto.achievements);
		}
		if (dto.activities) {
			await this.activities.updatePlaces(userId, dto.activities);
		}

		return this.getMe(userId);
	}
}
