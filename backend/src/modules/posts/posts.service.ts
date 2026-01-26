import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PostDto } from './posts.dto';
import { posts, trainingParticipants, users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { TrainingsService } from '../trainings/trainings.service';
import { StaticService } from '../static/static.service';

@Injectable()
export class PostsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly files: StaticService,
		private readonly trainings: TrainingsService,
	) {}

	public async getById(id: string): Promise<PostDto.Entity> {
		const [post] = await this.db.db
			.select({
				id: posts.id,
				title: posts.title,
				description: posts.description,
				trainingId: posts.trainingId,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,

				userCreator: {
					id: users.id,
					email: users.email,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
			})
			.from(posts)
			.where(eq(posts.id, id))
			.innerJoin(users, eq(users.id, posts.userCreatorId))
			.limit(1);
		if (!post) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		// Пока что все посты закреплены за своей тренировкой
		const training = await this.trainings.getExtendedById(post.trainingId!);
		return { ...post, training };
	}

	public async create(userId: string, dto: PostDto.Creation): Promise<PostDto.Entity> {
		const filesKeys: string[] = [];

		const [participant] = await this.db.db
			.select({
				id: trainingParticipants.id,
				userId: trainingParticipants.userId,
				trainingId: trainingParticipants.trainingId,
			})
			.from(trainingParticipants)
			.where(eq(trainingParticipants.id, dto.trainingParticipantId))
			.limit(1);

		// (проверку что треня уже завершена выполняет валидатор)
		if (!participant) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (participant.userId !== userId) {
			throw new ForbiddenException(ERRORS.FORBIDDEN);
		}

		if (typeof dto.files !== 'undefined') {
			for (const file of dto.files) {
				if (!(file satisfies Express.Multer.File)) {
					continue;
				}

				const uploadedFileKey = await this.files.uploadFile(file);
				filesKeys.push(uploadedFileKey);
			}
		}

		const [post] = await this.db.db
			.insert(posts)
			.values({
				title: dto.title,
				description: dto.description,

				userCreatorId: userId,
				trainingId: participant.trainingId,
			})
			.returning({ id: posts.id })
			.onConflictDoNothing();

		// @TODO try...catch на кетч ошибки загруженные файлы откатывать

		return await this.getById(post.id);
	}
}
