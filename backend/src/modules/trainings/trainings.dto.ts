import { TrainingType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { DebugTrainingRouteNode } from '../database/schema';
import { IsHexColor } from '@validation/property-decorators';
import { ERRORS } from '@shared/errors';

/**
 * Точка маршрута с клиента
 */
export interface TrainingRouteNodeClient {
	/** Метка времени относительно даты СТАРТА (started_at) тренировки */
	relTs: number;
	/** Высота */
	alt: number;
	/** Скорость км/ч */
	speed_kmh: number;

	paused: boolean;

	lat: number;
	lng: number;
}

export interface DebugTrainingRouteNodeClient extends TrainingRouteNodeClient {
	locationObject: {
		coords: {
			latitude: number;
			longitude: number;
			altitude: number | null;
			accuracy: number | null;
			altitudeAccuracy: number | null;
			heading: number | null;
			speed: number | null;
		};
		timestamp: number;
	};
}

export namespace TrainingDto {
	export type Entity = {
		id: string;
		type: TrainingType;
		creatorId?: string;

		createdAt: Date;

		startedAt: Date | null;
		finishedAt: Date | null;
	};

	export type HistoryEntity = {
		id: string;
		type: TrainingType;
		distanceM: number | null;

		createdAt: Date;
		startedAt: Date | null;
		finishedAt: Date | null;
	};

	export type SearchEntity = {
		id: string;
		type: TrainingType;

		createdAt: Date;
		startedAt: Date | null;
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

		/** Время старта. Для оффлайн тренировок */
		@IsOptional()
		@IsNumber(undefined, { message: `_ts:${ERRORS.BAD_REQUEST}` })
		ts?: number;
	}

	export class Finish {
		/** Время финиша. Для оффлайн тренировок */
		@IsOptional()
		@IsNumber(undefined, { message: `_ts:${ERRORS.BAD_REQUEST}` })
		ts?: number;
	}

	export class Sync {
		// @TODO валидировать
		@IsArray()
		metrics: DebugTrainingRouteNodeClient[];
	}
}

export namespace TrainingParticipantDto {
	export type Entity = {
		id: string;
		user: UserDto.Entity;
		colorHex: string | null;
		isSubscribed?: boolean;
	};

	export type ExtendedEntity = Entity & {
		route: TrainingRouteDto.Entity | null;
		metrics: TrainingMetricsDto.Entity | null;
	};
}

export namespace TrainingRouteDto {
	export type Entity = {
		points: DebugTrainingRouteNode[] | null;

		createdAt: Date;
		startedAt: Date | null;
		finishedAt: Date | null;
	};
}

export namespace TrainingMetricsDto {
	export type Entity = {
		timeSec: number;
		avgSpeedMPerSec: number;
		avgTempoSecondsPerKm: number;
		distanceM: number;
		altitudeGainM: number;
		kkcal: number;
	};
}
