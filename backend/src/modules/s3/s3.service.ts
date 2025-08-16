import { PutObjectCommand, S3Client as AWSClient } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { EnvService } from '../env/env.service';
import { Injectable } from '@nestjs/common';

interface S3Config {
	readonly bucketName: string;
	readonly region: string;
	readonly endpoint: string;
	readonly accessKeyId: string;
	readonly secretAccessKey: string;
}

@Injectable()
export class S3Service {
	private config: S3Config;
	private client: AWSClient;

	constructor(envService: EnvService) {
		this.config = {
			bucketName: envService.get('S3_BUCKET_NAME'),
			region: envService.get('S3_REGION'),
			endpoint: envService.get('S3_ENDPOINT'),
			accessKeyId: envService.get('S3_ACCESS_KEY_ID'),
			secretAccessKey: envService.get('S3_SECRET_ACCESS_KEY_ID'),
		};

		this.client = new AWSClient({
			region: this.config.region,
			endpoint: this.config.endpoint,
			credentials: {
				accessKeyId: this.config.accessKeyId,
				secretAccessKey: this.config.secretAccessKey,
			},
			forcePathStyle: true,
		});
	}

	/** Загрузить несколько файлов в хранилище.
	 * @returns мапа вида { старое_имя_файла: имя_файла_из_хранилища }
	 */
	async uploadFiles(files: File[]): Promise<Record<string, string>> {
		const keys: Record<string, string> = {};
		for (const file of files) {
			keys[file.name] = await this.uploadFile(file.name, file.type, await file.arrayBuffer());
		}

		return keys;
	}

	/** Загрузить файл в хранилще.
	 * @param originalName - название файла включяя расширение
	 * @param contentType - тип файла по стандарту Content-Type хедера
	 * @param arrayBuffer - исходный файл
	 *
	 * @returns ключ, по которому сохранён файл в хранилище
	 */
	async uploadFile(
		originalName: string,
		contentType: string = 'image/jpeg',
		arrayBuffer: ArrayBuffer,
	): Promise<string> {
		const maxRetries = 3;
		let attempt = 0;
		let errorMessage = '';
		for (; attempt < maxRetries; attempt++) {
			try {
				const fileExtension = this.getFileExtension(originalName);
				const key = `${uuidv4()}.${fileExtension}`;

				const uploadParams = {
					Bucket: this.config.bucketName,
					Key: key,
					Body: Buffer.from(arrayBuffer),
					ContentType: contentType,
					// ACL: isPublic ? 'public-read' : 'private',

					Metadata: {
						originalName: originalName,
						mimeType: contentType,
						extension: fileExtension,
					},
				};

				const command = new PutObjectCommand(uploadParams);
				await this.client.send(command);

				return key;
			} catch (error: any) {
				console.error(`Error uploading file to S3:`, String(error));
				console.log(`Retry ${attempt + 1} of ${maxRetries}`);
				errorMessage = `Error uploading file to S3: ${error.message}`;
			}
		}
		throw Error(errorMessage);
	}

	public getFileUrl(key: string): string {
		return `${this.config.endpoint}/${this.config.bucketName}/${key}`;
	}

	public getFileExtension(originalName: string): string {
		const splittedFilename = originalName.split('.');
		if (splittedFilename.length == 1) return '';

		return splittedFilename[splittedFilename.length - 1];
	}
}
