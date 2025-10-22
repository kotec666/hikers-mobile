import { IsOptional, Length } from 'class-validator';
import { AchievementDto } from '../achievements/achievements.dto';
import { ActivitiyDto } from '../activities/activities.dto';
import { FriendDto } from '../friends/friends.dto';
import { SubscriberDto, SubscribtionDto } from '../subscribers/subscribers.dto';
import { UserDto } from '../user/user.dto';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';
import { UserActivity } from '@shared/enums';
import { isUserActivityEnumValue, isUUID, TypedArray } from '@validation/decorators';

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

		/**
		 * @summary Смена аватара
		 * @description Изменение аватарки работает так:
		 * Если хотим заменить аву - передаем файл в это поле.
		 * Если хотим очистить аву - передаем null в это поле.
		 * Если ава не менялась - само собой не передаем это поле.
		 */
		@IsOptional()
		avatar?: Express.Multer.File | null;

		/**
		 * @summary Активности на показ
		 * @description Выставление активностей на показ.
		 * Ближе к началу списка - первее в топе.
		 * Ожидает массив значений из енама активностей (см. шаред).
		 * Сколько элементов в массиве - столько и мест в топе будет сохранено
		 */
		@IsOptional()
		@TypedArray(isUserActivityEnumValue)
		activities?: UserActivity[];

		/**
		 * @summary Ачивки на показ
		 * @description Выставление ачивок на показ.
		 * Ближе к началу списка - первее в топе.
		 * Ожидает массив id ачивок.
		 * Сколько элементов в массиве - столько и мест в топе будет сохранено
		 */
		@IsOptional()
		@TypedArray(isUUID)
		achievements?: string[];
	}
}
