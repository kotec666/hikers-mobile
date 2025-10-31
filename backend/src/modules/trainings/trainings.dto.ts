import { MeasuringUnit, TrainingType } from '@shared/enums';
import { UserDto } from '../user/user.dto';

export namespace TrainingDto {
	export type Entity = {
		id: string;
		creator: UserDto.Entity;
		type: TrainingTypeDto.Entity;
		createdAt: Date;
		startedAt: Date | null;
		finishedAt: Date | null;

		participants: TrainingParticipantDto.Entity[];
	};

	// @TODO
	// export type ExtendedEntity = {}
}

export namespace TrainingTypeDto {
	export type Entity = {
		name: TrainingType;
		measuringUnit: MeasuringUnit;
		iconFilename: string | null;
	};
}

export namespace TrainingParticipantDto {
	export type Entity = {
		user: UserDto.Entity;
		colorHex: string | null;
	};
}
