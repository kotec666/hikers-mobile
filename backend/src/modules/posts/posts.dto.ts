import { ERRORS } from '@shared/errors';
import { FinishedTrainingParticipant, isFile, TypedArray } from '@validation/decorators';
import { IsOptional, IsUUID, Length } from 'class-validator';
import { UserDto } from '../user/user.dto';
import { TrainingDto } from '../trainings/trainings.dto';
import { lengths } from '@shared/lengths';

export namespace PostDto {
	export type Entity = {
		id: string;
		userCreator: UserDto.Entity;
		training: TrainingDto.ExtendedEntity;

		title: string;
		description: string | null;

		createdAt: Date;
		updatedAt: Date | null;

		fileNames: string[];
		likes: UserDto.Entity[];
	};

	/** Form-Data запрос */
	export class Creation {
		@IsUUID('4', { message: `_trainingParticipantId:${ERRORS.BAD_REQUEST}` })
		@FinishedTrainingParticipant()
		trainingParticipantId: string;

		@Length(lengths.post.title.min, lengths.post.title.max, { message: `_title:${ERRORS.INVALID_LENGTH}` })
		title: string;

		@IsOptional()
		description?: string;

		@IsOptional()
		@TypedArray(isFile)
		files?: Express.Multer.File[];
	}
}
