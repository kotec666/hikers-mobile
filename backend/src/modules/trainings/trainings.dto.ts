import { TrainingType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { DebugTrainingRouteNode } from '../database/schema';
import { IsHexColor, NotNegative } from '@validation/property-decorators';
import { ERRORS } from '@shared/errors';
import { Type } from 'class-transformer';

/**
 * Точка маршрута с клиента
 */
export class TrainingRouteNodeClient {
	/** Метка времени относительно даты СТАРТА (started_at) тренировки */
	@NotNegative({ message: `_relTs:${ERRORS.MISMATCH}` })
	@IsInt({ message: `_relTs:${ERRORS.BAD_REQUEST}` })
	relTs: number;
	/** Высота */

	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_alt:${ERRORS.BAD_REQUEST}` })
	alt: number;

	/** Скорость км/ч */
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_speed_kmh:${ERRORS.BAD_REQUEST}` })
	speed_kmh: number;

	@IsBoolean({ message: `_paused:${ERRORS.BAD_REQUEST}` })
	paused: boolean;

	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_lat:${ERRORS.BAD_REQUEST}` })
	lat: number;
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_lng:${ERRORS.BAD_REQUEST}` })
	lng: number;
}

export class DebugLocationObjectCoordsClient {
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_latitude:${ERRORS.BAD_REQUEST}` })
	latitude: number;
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_longitude:${ERRORS.BAD_REQUEST}` })
	longitude: number;
	@IsOptional()
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_altitude:${ERRORS.BAD_REQUEST}` })
	altitude: number | null;
	@IsOptional()
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_accuracy:${ERRORS.BAD_REQUEST}` })
	accuracy: number | null;
	@IsOptional()
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_altitudeAccuracy:${ERRORS.BAD_REQUEST}` })
	altitudeAccuracy: number | null;
	@IsOptional()
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_heading:${ERRORS.BAD_REQUEST}` })
	heading: number | null;
	@IsOptional()
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_speed:${ERRORS.BAD_REQUEST}` })
	speed: number | null;
}

export class DebugLocationObjectClient {
	@ValidateNested({ message: `_coords:${ERRORS.BAD_REQUEST}` })
	@Type(() => DebugLocationObjectCoordsClient)
	coords: DebugLocationObjectCoordsClient;

	@IsNumber(
		{ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
		{ message: `_timestamp:${ERRORS.BAD_REQUEST}` },
	)
	timestamp: number;
}

export class DebugTrainingRouteNodeClient extends TrainingRouteNodeClient {
	@ValidateNested({ message: `_locationObject:${ERRORS.BAD_REQUEST}` })
	@Type(() => DebugLocationObjectClient)
	locationObject: DebugLocationObjectClient;
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
		@IsInt({ message: `_ts:${ERRORS.BAD_REQUEST}` })
		ts?: number;
	}

	export class Finish {
		/** Время финиша. Для оффлайн тренировок */
		@IsOptional()
		@IsInt({ message: `_ts:${ERRORS.BAD_REQUEST}` })
		ts?: number;
	}

	export class Sync {
		@ValidateNested({ each: true })
		@Type(() => DebugTrainingRouteNodeClient)
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
