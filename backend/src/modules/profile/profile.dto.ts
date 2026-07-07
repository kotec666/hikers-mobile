import { IsOptional, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { AchievementDto } from '../achievements/achievements.dto';
import { ActivitiyDto } from '../activities/activities.dto';
import { UserDto } from '../user/user.dto';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';
import { FriendStatus, UserActivity } from '@shared/enums';
import { isUserActivityEnumValue, isUUID, TypedArray, UniqueUsername } from '@validation/property-decorators';
import { toArray } from '@transformers/array.transformer';

export namespace ProfileDto {
	export type Entity = {
		user: UserDto.Entity;
		subscribers: number;
		subscriptions: number;
		friends: number;
		isFriend?: FriendStatus;
		isSubscribed?: boolean;
		achievements: AchievementDto.Entity[];
		activities: ActivitiyDto.Entity[];
	};

	export type MyEntity = {
		user: UserDto.EntityWithEmail;
		subscribers: number;
		subscriptions: number;
		friends: number;
		isFriend?: FriendStatus;
		isSubscribed?: boolean;
		achievements: AchievementDto.Entity[];
		activities: ActivitiyDto.Entity[];
	};

	/** Form-Data запрос */
	export class Edit {
		@IsOptional()
		@UniqueUsername()
		@Matches(/^[a-zA-Z0-9]+$/, { message: `_username:${ERRORS.MISMATCH}` })
		@Length(lengths.user.username.min, lengths.user.username.max, { message: `_username:${ERRORS.INVALID_LENGTH}` })
		username?: string;

		@IsOptional()
		@Length(lengths.user.name.min, lengths.user.name.max, { message: `_name:${ERRORS.INVALID_LENGTH}` })
		name?: string;

		/**
		 * @summary Смена аватара
		 * @description Изменение аватарки работает так:
		 * Если хотим заменить аву - передаем файл в это поле.
		 * Если хотим очистить аву - передаем строку в это поле.
		 * Если ава не менялась - само собой не передаем это поле.
		 */
		@IsOptional()
		avatarFilename?: Express.Multer.File | string;

		/**
		 * @summary Активности на показ
		 * @description Выставление активностей на показ.
		 * Ближе к началу списка - первее в топе.
		 * Ожидает массив значений из енама активностей (см. шаред).
		 * Сколько элементов в массиве - столько и мест в топе будет сохранено
		 */
		@IsOptional()
		@TypedArray(isUserActivityEnumValue)
		@Transform(({ value }) => toArray(value))
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
		@Transform(({ value }) => {
			if (typeof value === 'string') {
				return value.split(',').map((v) => v.trim());
			}
			return value;
		})
		achievements?: string[];
	}
}
