import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
	MAX_FILE_SIZE_MEGABYTES,
	REPORT_MAX_FILES_COUNT,
	VALID_IMAGE_MIME_TYPES,
	VALID_VIDEO_MIME_TYPES,
} from '@shared/constants';
import { ERRORS } from '@shared/errors';
import { User, UserData } from '@decorators/user.decorator';
import { ReportDto } from './reports.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { NotNegative } from '@validation/query-decorators';
import { ParseEnumArray } from '@validation/parameter-decorators';
import { ReportType } from '@shared/enums';

@UseInterceptors(UserInterceptor)
@Controller('reports')
export class ReportsController {
	constructor(private readonly service: ReportsService) {}

	/**
	 * @tag Reports
	 * @summary Сообщить о проблеме или оставить жалобу
	 * @security token
	 */
	@Post()
	@UseInterceptors(
		FilesInterceptor('files', REPORT_MAX_FILES_COUNT, {
			fileFilter: (_req, file, callb) => {
				if (
					!VALID_IMAGE_MIME_TYPES.includes(file.mimetype) &&
					!VALID_VIDEO_MIME_TYPES.includes(file.mimetype)
				) {
					return callb(new BadRequestException(`_files:${ERRORS.BAD_REQUEST}`), false);
				}

				callb(null, true);
			},
			limits: {
				fileSize: MAX_FILE_SIZE_MEGABYTES * 1024 * 1024,
			},
		}),
	)
	public async create(
		@User() user: UserData,
		@Body() dto: ReportDto.Creation,
		@UploadedFiles() files: Express.Multer.File[],
	): Promise<CommonDto.BooleanResponse> {
		if (files.length) {
			dto.files = files;
		}

		return await this.service.create(user.id, dto);
	}

	/**
	 * @tag Reports
	 * @summary Получить свои сообщения о проблемах с пагинацией и фильтром по типам
	 * @security token
	 */
	@Get('my')
	public async getMy(
		@User() user: UserData,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
		@ParseEnumArray({ key: 'types', enum: ReportType }) @Query('types') types?: ReportType[],
	) {
		return await this.service.getByUser(user.id, page, limit, types);
	}
}
