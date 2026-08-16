import { ReportType } from '@shared/enums';
import { UserDto } from '../user/user.dto';
import { IsEnum, IsNumber, IsOptional, IsUUID, Length, ValidateNested } from 'class-validator';
import { lengths } from '@shared/lengths';
import { ERRORS } from '@shared/errors';
import { Type } from 'class-transformer';

class DeviceScreenInfo {
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_width:${ERRORS.BAD_REQUEST}` })
	width: number;
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_height:${ERRORS.BAD_REQUEST}` })
	height: number;
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_scale:${ERRORS.BAD_REQUEST}` })
	scale: number;
	@IsNumber({ allowInfinity: false, allowNaN: false }, { message: `_fontScale:${ERRORS.BAD_REQUEST}` })
	fontScale: number;
}

class DeviceInfo {
	@IsOptional()
	@Length(0, 64, { message: `_platform:${ERRORS.BAD_REQUEST}` })
	platform?: string;
	@IsOptional()
	@Length(0, 64, { message: `_brand:${ERRORS.BAD_REQUEST}` })
	brand?: string;
	@IsOptional()
	@Length(0, 64, { message: `_manufacturer:${ERRORS.BAD_REQUEST}` })
	manufacturer?: string;
	@IsOptional()
	@Length(0, 128, { message: `_modelName:${ERRORS.BAD_REQUEST}` })
	modelName?: string;
	@IsOptional()
	@Length(0, 128, { message: `_deviceName:${ERRORS.BAD_REQUEST}` })
	deviceName?: string;
	@IsOptional()
	@Length(0, 64, { message: `_deviceType:${ERRORS.BAD_REQUEST}` })
	deviceType?: string;
	@IsOptional()
	@Length(0, 128, { message: `_osName:${ERRORS.BAD_REQUEST}` })
	osName?: string;
	@IsOptional()
	@Length(0, 64, { message: `_osVersion:${ERRORS.BAD_REQUEST}` })
	osVersion?: string;
	@IsOptional()
	@Length(0, 64, { message: `_appVersion:${ERRORS.BAD_REQUEST}` })
	appVersion?: string;
	@IsOptional()
	@Length(0, 128, { message: `_buildNumber:${ERRORS.BAD_REQUEST}` })
	buildNumber?: string;
	@IsOptional()
	@Length(0, 32, { message: `_locale:${ERRORS.BAD_REQUEST}` })
	locale?: string;

	@IsOptional()
	@ValidateNested({ message: `_screen:${ERRORS.BAD_REQUEST}` })
	@Type(() => DeviceScreenInfo)
	screen?: DeviceScreenInfo;
}

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
		deviceInfo: DeviceInfo | null;
	};

	export class Creation {
		@IsEnum(ReportType, { message: `_type:${ERRORS.MISMATCH}` })
		type: ReportType;

		@IsOptional()
		@IsUUID('4', { message: `_relEntityId:${ERRORS.MISMATCH}` })
		relEntityId?: string;

		@IsOptional()
		@ValidateNested({ message: `_deviceInfo:${ERRORS.BAD_REQUEST}` })
		@Type(() => DeviceInfo)
		deviceInfo?: DeviceInfo;

		@IsOptional()
		@Length(lengths.reports.text.min, lengths.reports.text.max, {
			message: `_text:${ERRORS.INVALID_LENGTH}`,
		})
		text?: string;

		// @TODO мб когда-то вернуть, но тогда нужен Form-Data запрос
		// @IsOptional()
		// files?: Express.Multer.File[];
	}
}
