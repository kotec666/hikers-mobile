import { TrainingType } from '@shared/enums';
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

	export type ExtendedEntity = Required<TrainingDto.Entity> & {
		creator: UserDto.Entity;
		participants: TrainingParticipantDto.ExtendedEntity[];
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

export namespace TrainingParticipantDto {
	export type Entity = {
		id: string;
		user: UserDto.Entity;
		colorHex: string | null;
	};

	export type ExtendedEntity = Entity & {
		route: TrainingRouteDto.Entity | null;
		metrics: TrainingMetricsDto.Entity | null;
	};
}

export namespace TrainingRouteDto {
	export type Entity = {
		points: TrainingRouteNode[] | null;

		createdAt: Date;
		startedAt: Date | null;
		finishedAt: Date | null;
	};
}

export namespace TrainingMetricsDto {
	export type Entity = {
		timeMin: number;
		avgSpeedKmh: number;
		avgTempoSecondsPerKm: number;
		distanceM: number;
		altitudeGainM: number;
		kkcal: number;
	};
}
