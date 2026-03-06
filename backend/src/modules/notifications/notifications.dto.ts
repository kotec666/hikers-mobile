import { NotificationType } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { IsPositive } from 'class-validator';

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
		relEntityId: string;
	};

	export class Pull {
		@IsPositive({ message: `_page:${ERRORS.MISMATCH}` })
		page: number;
		@IsPositive({ message: `_limit:${ERRORS.MISMATCH}` })
		limit: number;
	}
}
