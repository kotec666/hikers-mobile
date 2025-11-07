import { MeasuringUnit, TrainingType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsEnum } from 'class-validator';
import { TrainingRouteNode } from '../database/schema';
import { IsHexColor } from '@validation/decorators';
import { ERRORS } from '@shared/errors';

export namespace TrainingDto {
	export type Entity = {
		id: string;
		type: TrainingType;
		creatorId?: string;

		/** Момент создания тренировки - как только отправился первый инвайт */
		createdAt: Date; // @TODO мб выпилить

		/** Момент старта тренировки - как только создатель начал тренировку */
		startedAt: Date | null;
		/** Момент финиша тренировки - как только создатель закончил тренировку */
		finishedAt: Date | null;
	};

	export type ExtendedEntity = Omit<TrainingDto.Entity, 'type'> & {
		creator: UserDto.Entity;
		// @TODO TrainingParticipantDto.Extendedentity[] с маршрутами, метриками итд
		participants: TrainingParticipantDto.Entity[];
		type: TrainingTypeDto.Entity;
	};

	export type EntityWithCurrentParticipant = Entity & {
		participant: TrainingParticipantDto.Entity;
	};

	export class Start {
		@IsEnum(TrainingType, { message: `_type:${ERRORS.MISMATCH}` })
		type: TrainingType;

		@IsHexColor()
		colorHex: string;
	}

	export class Sync {
		// @TODO валидировать
		metrics: TrainingRouteNode[];
	}
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
		id: string;
		user: UserDto.Entity;
		colorHex: string | null;
	};
}

export namespace TrainingRouteDto {
	export type Entity = {
		participant: TrainingParticipantDto.Entity;
		colorHex: string | null;
		points: TrainingRouteNode[];

		createdAt: Date;
		startedAt: Date | null;
		finishedAt: Date | null;
	};
}
