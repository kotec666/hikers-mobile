import {
	PutObjectCommand,
	ListObjectsV2Command,
	DeleteObjectsCommand,
	S3Client as AWSClient,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { EnvService } from '../env/env.service';
import { media } from '../database/schema';
import { ERRORS } from '@shared/errors';
import * as stream from 'stream';

interface S3Config {
	readonly bucketName: string;
	readonly region: string;
	readonly endpoint: string;
	readonly accessKeyId: string;
	readonly secretAccessKey: string;
}

@Injectable()
export class StaticService {
	private config: S3Config;
	private client: AWSClient;

	constructor(
		envService: EnvService,
		private readonly db: DatabaseService,
	) {
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
	async uploadFiles(files: Express.Multer.File[]): Promise<Record<string, string>> {
		const keys: Record<string, string> = {};
		for (const file of files) {
			keys[file.originalname] = await this.uploadFile(file);
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
	async uploadFile(file: Express.Multer.File): Promise<string> {
		const bufferOriginalName = Buffer.from(file.originalname).toString('base64');
		const maxRetries = 3;

		let attempt = 0;
		let errorMessage = '';
		for (; attempt < maxRetries; attempt++) {
			try {
				const fileExtension = this.getFileExtension(file.originalname);
				const key = `${uuidv4()}.${fileExtension}`;

				const uploadParams = {
					Bucket: this.config.bucketName,
					Key: key,
					Body: Buffer.from(file.buffer),
					ContentType: file.mimetype,
					// ACL: isPublic ? 'public-read' : 'private',

					Metadata: {
						originalName: bufferOriginalName,
						mimeType: file.mimetype,
						extension: fileExtension,
					},
				};

				const command = new PutObjectCommand(uploadParams);
				await this.client.send(command);

				await this.db.db.insert(media).values({
					filename: key,
					originalName: bufferOriginalName,
					fileType: file.mimetype,
				});
				return key;
			} catch (error: any) {
				console.error(`Error uploading file to S3:`, String(error));
				console.log(`Retry ${attempt + 1} of ${maxRetries}`);
				errorMessage = `Error uploading file to S3: ${error.message}`;
			}
		}
		throw Error(errorMessage);
	}

	async getFile(key: string): Promise<stream.Readable> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.config.bucketName,
				Key: key,
			});

			const response = await this.client.send(command);

			// Проверяем, что response.Body является потоком
			if (!response.Body || typeof response.Body !== 'object') {
				throw new InternalServerErrorException(ERRORS.INTERNAL);
			}

			return response.Body as stream.Readable;
		} catch (error) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
	}

	async deleteFile(key: string): Promise<void> {
		try {
			const command = new DeleteObjectsCommand({
				Bucket: this.config.bucketName,
				Delete: {
					Objects: [{ Key: key }],
				},
			});

			await this.client.send(command);
		} catch (error) {
			throw new InternalServerErrorException(`S3 error: ${error.message}`);
		}
	}

	public getFileExtension(originalName: string): string {
		const splittedFilename = originalName.split('.');
		if (splittedFilename.length == 1) return '';

		return splittedFilename[splittedFilename.length - 1];
	}

	async clearBucket() {
		const { bucketName } = this.config;

		// Получаем список всех объектов
		const listParams = {
			Bucket: bucketName,
		};

		const listCommand = new ListObjectsV2Command(listParams);
		const listResult = await this.client.send(listCommand);

		// Бакет и так пустой
		if (!listResult.Contents || listResult.Contents.length === 0) {
			return;
		}

		const objectsToDelete = listResult.Contents.map(({ Key }) => ({ Key }));
		const deleteParams = {
			Bucket: bucketName,
			Delete: { Objects: objectsToDelete },
		};

		const deleteCommand = new DeleteObjectsCommand(deleteParams);
		await this.client.send(deleteCommand);

		// Рекурсивная очистка, если объектов >1000 (ListObjectsV2 возвращает до 1000 ключей за раз)
		if (listResult.IsTruncated) {
			await this.clearBucket(); // Повторяем, пока бакет не опустеет
		}
	}
}
