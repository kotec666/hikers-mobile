import {
	PutObjectCommand,
	ListObjectsV2Command,
	DeleteObjectsCommand,
	S3Client as AWSClient,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { EnvService } from '../env/env.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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

	async getFile(key: string): Promise<{
		body: Buffer;
		contentType: string | undefined;
		contentLength: number | undefined;
		originalName: string | undefined;
		metadata: Record<string, string> | undefined;
	}> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.config.bucketName,
				Key: key,
			});

			const response = await this.client.send(command);
			console.log('Response:', response);

			// Проверяем, что response.Body является потоком
			if (!response.Body || typeof response.Body !== 'object') {
				throw new Error('Response body is not a valid stream');
			}

			// Конвертируем поток в Buffer
			const chunks: Buffer[] = [];
			const stream = response.Body as NodeJS.ReadableStream;

			stream.on('data', (chunk) => {
				console.log('Chunk received:', chunk);
				chunks.push(chunk);
			});

			stream.on('end', () => {
				console.log('Stream ended');
			});

			stream.on('error', (err) => {
				console.error('Stream error:', err);
				throw new InternalServerErrorException('Error reading stream');
			});

			// Используем Promise для ожидания завершения потока
			await new Promise<void>((resolve, reject) => {
				stream.on('end', resolve);
				stream.on('error', reject);
			});

			const body = Buffer.concat(chunks);
			console.log('Body:', body);

			return {
				body,
				contentType: response.ContentType,
				contentLength: response.ContentLength,
				originalName: response.Metadata?.originalname || response.Metadata?.originalName,
				metadata: response.Metadata,
			};
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
