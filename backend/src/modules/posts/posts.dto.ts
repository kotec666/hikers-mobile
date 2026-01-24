import { ERRORS } from '@shared/errors';
import { IsTrainingFinished, IsTrainingParticipant } from '@validation/decorators';
import { IsUUID, Length } from 'class-validator';
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

		// @TODO фотки, лайки
	};

	export class Creation {
		@IsUUID(undefined, { message: `_trainingParticipantId:${ERRORS.BAD_REQUEST}` })
		@IsTrainingParticipant()
		@IsTrainingFinished()
		trainingParticipantId: string;

		@Length(lengths.post.title.min, lengths.post.title.max, { message: `_title:${ERRORS.INVALID_LENGTH}` })
		title: string;
		description: string;

		// @TODO фотки
	}
}
