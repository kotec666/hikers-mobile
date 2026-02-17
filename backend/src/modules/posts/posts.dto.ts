import { ERRORS } from '@shared/errors';
import { isUUIDFilename, TypedArray } from '@validation/property-decorators';
import { IsOptional, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserDto } from '../user/user.dto';
import { TrainingDto } from '../trainings/trainings.dto';
import { lengths } from '@shared/lengths';
import { toArray } from '@transformers/array.transformer';

export namespace PostDto {
	export type Entity = {
		id: string;

		/** Подписан ли на автора поста */
		isSubscribed: boolean;

		userCreator: UserDto.Entity;
		training: TrainingDto.ExtendedEntity;

		title: string;
		description: string | null;

		createdAt: Date;
		updatedAt: Date | null;

		fileNames: string[];

		isLiked: boolean;
		likesCount: number;
	};

	/** Form-Data запрос */
	export class Creation {
		@IsUUID('4', { message: `_trainingId:${ERRORS.BAD_REQUEST}` })
		trainingId: string;

		@Length(lengths.post.title.min, lengths.post.title.max, { message: `_title:${ERRORS.INVALID_LENGTH}` })
		title: string;

		@IsOptional()
		description?: string;

		@IsOptional()
		files?: Express.Multer.File[];
	}

	/** Form-Data запрос */
	export class Edit {
		@IsOptional()
		@Length(lengths.post.title.min, lengths.post.title.max, { message: `_title:${ERRORS.INVALID_LENGTH}` })
		title?: string;

		@IsOptional()
		@Length(lengths.post.description.min, lengths.post.description.max, {
			message: `_description:${ERRORS.INVALID_LENGTH}`,
		})
		description?: string;

		@IsOptional()
		@Transform(({ value }) => toArray(value))
		@TypedArray(isUUIDFilename)
		deletedFilenames?: string[];

		@IsOptional()
		files?: Express.Multer.File[];
	}
}
