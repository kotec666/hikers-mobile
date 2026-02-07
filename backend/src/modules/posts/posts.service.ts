import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PostDto } from './posts.dto';
import { postLikes, postMedia, posts, trainingParticipants, users } from '../database/schema';
import { desc, eq, ne, count, and } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { TrainingsService } from '../trainings/trainings.service';
import { StaticService } from '../static/static.service';
import { CommonDto } from 'src/common/dto/common.dto';
import { UserDto } from '../user/user.dto';
import { SubscribersService } from '../subscribers/subscribers.service';

@Injectable()
export class PostsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly files: StaticService,
		private readonly trainings: TrainingsService,
		private readonly subscribers: SubscribersService,
	) {}

	public async getByUser(userId: string, someUserId: string, page: number, limit: number): Promise<PostDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const rows = await this.db.db
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
			// @TODO доделать чтобы участие в постах тоже засчитывало
			.where(eq(posts.userCreatorId, someUserId))
			.innerJoin(users, eq(users.id, posts.userCreatorId))
			.orderBy(desc(posts.createdAt))
			.offset(offset)
			.limit(limit);

		// @TODO костыль переделать
		const postEntities: PostDto.Entity[] = [];
		for (const row of rows) {
			const isLiked = await this.isLiked(userId, row.id);
			const likesCount = await this.getLikesCount(row.id);

			const fileNames = await this.getFileNames(row.id);

			// Пока что все посты закреплены за своей тренировкой
			const training = await this.trainings.getExtendedById(row.trainingId!);
			const isSubscribed = await this.subscribers.isSubscribed(userId, row.userCreator.id);

			postEntities.push({ ...row, isSubscribed, likesCount, isLiked, training, fileNames });
		}

		return postEntities;
	}

	public async getFeed(userId: string, page: number, limit: number): Promise<PostDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const rows = await this.db.db
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
			.where(ne(posts.userCreatorId, userId))
			.innerJoin(users, eq(users.id, posts.userCreatorId))
			.orderBy(desc(posts.createdAt))
			.offset(offset)
			.limit(limit);

		// @TODO костыль переделать
		const postEntities: PostDto.Entity[] = [];
		for (const row of rows) {
			const isLiked = await this.isLiked(userId, row.id);
			const likesCount = await this.getLikesCount(row.id);

			const fileNames = await this.getFileNames(row.id);

			// Пока что все посты закреплены за своей тренировкой
			const training = await this.trainings.getExtendedById(row.trainingId!);
			const isSubscribed = await this.subscribers.isSubscribed(userId, row.userCreator.id);

			postEntities.push({ ...row, isSubscribed, likesCount, isLiked, training, fileNames });
		}

		return postEntities;
	}

	public async getById(userId: string, id: string): Promise<PostDto.Entity> {
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

		const isLiked = await this.isLiked(userId, id);
		const likesCount = await this.getLikesCount(id);

		const fileNames = await this.getFileNames(id);

		// Пока что все посты закреплены за своей тренировкой
		const training = await this.trainings.getExtendedById(post.trainingId!);
		const isSubscribed = await this.subscribers.isSubscribed(userId, post.userCreator.id);

		return { ...post, isSubscribed, likesCount, isLiked, training, fileNames };
	}

	public async create(userId: string, dto: PostDto.Creation): Promise<PostDto.Entity> {
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

		// @TODO ловить ошибку на медиа
		if (typeof dto.files !== 'undefined') {
			await this.attachFiles(post.id, dto.files);
		}
		// @TODO try...catch на кетч ошибки загруженные файлы откатывать

		return await this.getById(userId, post.id);
	}

	public async attachFiles(postId: string, files: Express.Multer.File[]): Promise<string[]> {
		const mediaIds: string[] = [];

		for (const file of files) {
			if (!(file satisfies Express.Multer.File)) {
				continue;
			}

			const mediaFilename = await this.files.uploadFile(file);
			const [media] = await this.db.db
				.insert(postMedia)
				.values({
					postId,
					mediaFilename,
				})
				.returning({ id: postMedia.id });

			mediaIds.push(media.id);
		}

		return mediaIds;
	}

	public async likePost(postId: string, userId: string): Promise<CommonDto.BooleanResponse> {
		await this.db.db.insert(postLikes).values({
			postId,
			userId,
		});

		return { success: true };
	}

	public async isLiked(userId: string, postId: string): Promise<boolean> {
		const [row] = await this.db.db
			.select({ id: postLikes.userId })
			.from(postLikes)
			.where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

		return !!row;
	}

	public async getLikesCount(postId: string): Promise<number> {
		const [row] = await this.db.db
			.select({ count: count(postLikes.userId) })
			.from(postLikes)
			.where(eq(postLikes.postId, postId));

		return row.count;
	}

	public async getLikes(postId: string): Promise<UserDto.Entity[]> {
		const likedUsers = await this.db.db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				email: users.email,
				avatarFilename: users.avatarFilename,
			})
			.from(postLikes)
			.where(eq(postLikes.postId, postId))
			.innerJoin(users, eq(users.id, postLikes.userId));

		return likedUsers;
	}

	public async getFileNames(postId: string): Promise<string[]> {
		const fileNames = await this.db.db
			.select({
				mediaFilename: postMedia.mediaFilename,
			})
			.from(postMedia)
			.where(eq(postMedia.postId, postId));

		return fileNames.map((i) => i.mediaFilename);
	}
}
