import { IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { AchievementDto } from '../achievements/achievements.dto';
import { ActivitiyDto } from '../activities/activities.dto';
import { UserDto } from '../user/user.dto';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';
import { FriendStatus, UserActivity } from '@shared/enums';
import { isUserActivityEnumValue, isUUID, TypedArray } from '@validation/property-decorators';

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

	/** Form-Data запрос */
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
		@Transform(({ value }) => {
			if (typeof value === 'string') {
				return value.split(',').map((v) => v.trim());
			}
			return value;
		})
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
