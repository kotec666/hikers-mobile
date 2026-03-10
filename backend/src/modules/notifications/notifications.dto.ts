import { NotificationType } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { isUUID, IsUUIDFilename, TypedArray } from '@validation/property-decorators';
import { IsEnum, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export namespace NotificationDto {
	export type Entity = {
		id: string;
		action: Action;
		type: NotificationType;
		createdAt: Date;
		readedAt: Date | null;
	};

	export type Action = {
		text: string;
		iconFilename: string;
		relEntityId: string | null;
	};

	export class RequestPull {
		@IsPositive({ message: `_page:${ERRORS.MISMATCH}` })
		page: number;
		@IsPositive({ message: `_limit:${ERRORS.MISMATCH}` })
		limit: number;
	}

	export class RequestRead {
		@TypedArray(isUUID)
		ids: string[];
	}

	export class RequestDebug {
		@IsString()
		text: string;

		@IsUUIDFilename()
		iconFilename: string;

		@IsUUID('4', { message: `_iconFilename:${ERRORS.MISMATCH}` })
		@IsOptional()
		relEntityId?: string;

		@IsEnum(NotificationType, { message: `_type:${ERRORS.MISMATCH}` })
		type: NotificationType;
	}
}
