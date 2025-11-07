import { MeasuringUnit, TrainingType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsOptional } from 'class-validator';

export namespace TrainingDto {
	export type Entity = {
		id: string;
		type: TrainingType;
		creatorId?: string;

		/** Момент создания тренировки - как только отправился первый инвайт, или юзер начал соло тренировку */
		createdAt: Date;

		/** Момент старта тренировки - как только создатель начал тренировку */
		startedAt: Date | null;
		/** Момент финиша тренировки - как только создатель закончил тренировку */
		finishedAt: Date | null;
	};

	export class Start {
		type: TrainingType;

		/** Старт тренировки будет сразу после отправки запроса? (после старта нельзя приглашать/удалять участников) */
		@IsOptional()
		now: boolean = false;
	}

	export type ExtendedEntity = Omit<TrainingDto.Entity, 'type'> & {
		creator: UserDto.Entity;
		participants: TrainingParticipantDto.Entity[];
		type: TrainingTypeDto.Entity;
	};
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
