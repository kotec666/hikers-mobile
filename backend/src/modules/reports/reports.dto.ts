import { ReportType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsEnum, IsOptional, IsUUID, Length } from 'class-validator';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';

export namespace ReportDto {
	export type Entity = {
		id: string;
		fromUser: UserDto.Entity;
		type: ReportType;
		addons: Addons | null;
		text: string | null;
		createdAt: Date;

		fileNames: string[];
	};

	export type Addons = {
		relEntityId: string | null;
		// @TODO и тут мб расписать инфу для галочки Отправить сведения об устройстве
	};

	/** Form-Data запрос */
	export class Creation {
		@IsEnum(ReportType, { message: `_type:${ERRORS.MISMATCH}` })
		type: ReportType;

		@IsOptional()
		@IsUUID('4', { message: `_relEntityId:${ERRORS.MISMATCH}` })
		relEntityId?: string;

		@IsOptional()
		@Length(lengths.reports.text.min, lengths.reports.text.max, {
			message: `_text:${ERRORS.INVALID_LENGTH}`,
		})
		text?: string;

		@IsOptional()
		files?: Express.Multer.File[];
	}
}
