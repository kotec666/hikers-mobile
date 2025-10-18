import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TypedFormData } from '@nestia/core';
import { upload } from '../../common/global/multer.instance';
import { StaticService } from './static.service';
import { StaticDto } from './static.dto';

@Controller('static')
export class StaticController {
	constructor(private readonly service: StaticService) {}

	/**
	 * @tag Static
	 * @summary Получить файл по его ключу
	 */
	@Get(':key')
	async serveStatic(@Param('key') key: string) {
		return await this.service.getFile(key);
	}

	/**
	 * @tag Static
	 * @summary Загрузить файл(-ы)
	 */
	@Post('files')
	async uploadFile(@TypedFormData.Body(() => upload) body: { files: File[] }): Promise<StaticDto.UploadedFiles> {
		return this.service.uploadFiles(body.files);
	}

	/**
	 * @tag Static
	 * @summary Очистить всё под чистую чистяк пустяк шмурдяк
	 */
	@Delete()
	async clearBucket() {
		return this.service.clearBucket();
	}
}
