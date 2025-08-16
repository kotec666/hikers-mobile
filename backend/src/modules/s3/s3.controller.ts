import { Controller } from '@nestjs/common';
import { TypedRoute, TypedFormData, TypedParam } from '@nestia/core';
import { upload } from '../../common/global/multer.instance';
import { S3Service } from './s3.service';
import { S3 } from './s3.dto';

@Controller('s3-testing')
export class S3Controller {
	constructor(private readonly service: S3Service) {}

	/**
	 * @tag S3Testing
	 * @summary Upload files to S3
	 */
	@TypedRoute.Post('files')
	async uploadFile(@TypedFormData.Body(() => upload) body: { files: File[] }): Promise<S3.UploadedFiles> {
		return this.service.uploadFiles(body.files);
	}

	/**
	 * @tag S3Testing
	 * @summary Get file url by key
	 */
	@TypedRoute.Get(':key')
	async getFileUrl(@TypedParam('key') key: string): Promise<S3.UploadedFileUrl> {
		return { url: this.service.getFileUrl(key) };
	}

	/**
	 * @tag S3Testing
	 * @summary Clear bucket
	 */
	@TypedRoute.Delete()
	async clearBucket() {
		return this.service.clearBucket();
	}
}
