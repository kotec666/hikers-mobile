import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileDto } from './profile.dto';
import { UserService } from '../user/user.service';
import { SubscribersService } from '../subscribers/subscribers.service';
import { FriendsService } from '../friends/friends.service';
import { AchievementsService } from '../achievements/achievements.service';
import { ActivitiesService } from '../activities/activities.service';
import { StaticService } from '../static/static.service';
import { UserDto } from '../user/user.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { ERRORS } from '@shared/errors';

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

	public async getOtherProfileByUsername(currentUserId: string, otherUsername: string): Promise<ProfileDto.Entity> {
		const otherUser = await this.users.getUserByUsername(otherUsername);
		return this.getOtherProfileById(currentUserId, otherUser.id);
	}

	public async getOtherProfileById(currentUserId: string, otherUserId: string): Promise<ProfileDto.Entity> {
		const profile = await this.getProfile(otherUserId);

		// Создаем новый объект без нужных полей
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { email, isEmailConfirmed, ...userWithoutSensitive } = profile.user;

		const isFriend = await this.friends.getFriendsStatus(currentUserId, otherUserId);
		const isSubscribed = await this.subs.isSubscribed(currentUserId, otherUserId);

		return {
			...profile,
			user: userWithoutSensitive,
			isFriend,
			isSubscribed,
		};
	}

	public async getProfile(userId: string): Promise<ProfileDto.MyEntity> {
		const user = await this.users.getUserWithEmail(userId);

		const subscribers = await this.subs.getSubscribersCount(userId);
		const subscriptions = await this.subs.getSubscriptionsCount(userId);

		const friends = await this.friends.getFriendsCount(userId);

		const achievements = await this.achievements.getClaimed(userId, PROFILE_TOP_ACHIEVEMENTS_COUNT);
		const activities = await this.activities.getAll(userId, PROFILE_TOP_ACTIVITIES_COUNT);

		return {
			user,
			subscribers,
			subscriptions,
			friends,
			achievements,
			activities,
		};
	}

	public async setBadge(userId: string, badge: string | null): Promise<CommonDto.BooleanResponse> {
		await this.users.updateUser(userId, {
			badge,
		});

		return { success: true };
	}

	public async setColor(userId: string, colorRgb: string): Promise<CommonDto.BooleanResponse> {
		await this.users.updateUser(userId, {
			color: colorRgb,
		});

		return { success: true };
	}

	private async isUsernameUnique(userId: string, usernameToCheck: string): Promise<boolean> {
		try {
			const user = await this.users.getUserByUsername(usernameToCheck);
			if (user.id === userId) {
				return true;
			}
		} catch (error) {
			if (error instanceof NotFoundException) {
				return true;
			}
		}

		return false;
	}

	public async edit(userId: string, dto: ProfileDto.Edit): Promise<ProfileDto.Entity> {
		dto = Object.fromEntries(Object.entries(dto).filter(([, val]) => typeof val !== 'undefined'));

		if (Object.values(dto).length === 0) {
			throw new BadRequestException();
		}

		if (dto.username) {
			if (!(await this.isUsernameUnique(userId, dto.username))) {
				throw new BadRequestException(`_username:${ERRORS.ALREADY_EXISTS}`);
			}
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

		const userPromises: Promise<unknown>[] = [];
		if (Object.values(userDto).filter((val) => !!val).length > 0) {
			userPromises.push(this.users.updateUser(userId, userDto));
		}

		if (dto.achievements) {
			userPromises.push(this.achievements.updatePlaces(userId, dto.achievements));
		}
		if (dto.activities) {
			userPromises.push(this.activities.updatePlaces(userId, dto.activities));
		}

		await Promise.all(userPromises);

		return this.getProfile(userId);
	}
}
