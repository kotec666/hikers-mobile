import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PostDto } from './posts.dto';
import { postLikes, postMedia, posts, training, users } from '../database/schema';
import { desc, eq, ne, count, and, sql } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { TrainingsService } from '../trainings/trainings.service';
import { StaticService } from '../static/static.service';
import { CommonDto } from 'src/common/dto/common.dto';
import { UserDto } from '../user/user.dto';
import { SubscribersService } from '../subscribers/subscribers.service';
import { TrainingParticipantDto } from '../trainings/trainings.dto';

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
		const [trainingRow] = await this.db.db
			.select({
				id: training.id,
				userCreatorId: training.userCreatorId,
				finishedAt: training.finishedAt,
			})
			.from(training)
			.where(eq(training.id, dto.trainingId))
			.limit(1);
		if (!trainingRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (trainingRow.userCreatorId !== userId) {
			throw new NotFoundException(ERRORS.FORBIDDEN);
		}
		if (!trainingRow.finishedAt) {
			throw new NotFoundException(ERRORS.USER_IN_NOT_FINISHED_TRAINING);
		}

		const [post] = await this.db.db
			.insert(posts)
			.values({
				title: dto.title,
				description: dto.description,

				userCreatorId: userId,
				trainingId: dto.trainingId,
			})
			.returning({ id: posts.id });

		// @TODO ловить ошибку на медиа
		if (typeof dto.files !== 'undefined') {
			await this.attachFiles(post.id, dto.files);
		}
		// @TODO try...catch на кетч ошибки загруженные файлы откатывать

		return await this.getById(userId, post.id);
	}

	public async areMediasAttachedToPost(postId: string, mediaFilenames: string[]): Promise<boolean> {
		const postMedias = await this.db.db
			.select({ mediaFilename: postMedia.mediaFilename })
			.from(postMedia)
			.where(eq(postMedia.postId, postId));

		return mediaFilenames.every((fname) => postMedias.find((el) => el.mediaFilename === fname));
	}

	public async edit(postId: string, userId: string, dto: PostDto.Edit): Promise<CommonDto.BooleanResponse> {
		dto = Object.fromEntries(Object.entries(dto).filter(([, val]) => typeof val !== 'undefined'));

		if (Object.values(dto).length === 0) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		const [post] = await this.db.db
			.select({ userCreatorId: posts.userCreatorId })
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);
		if (!post) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (post.userCreatorId !== userId) {
			throw new ForbiddenException(ERRORS.FORBIDDEN);
		}

		if (typeof dto.deletedFilenames !== 'undefined') {
			if (!(await this.areMediasAttachedToPost(postId, dto.deletedFilenames))) {
				throw new BadRequestException(`_deletedFilenames:${ERRORS.MISMATCH}`);
			}

			await this.detachFiles(postId, dto.deletedFilenames);
		}

		if (typeof dto.files !== 'undefined') {
			await this.attachFiles(postId, dto.files);
		}

		const dtoFields = { updatedAt: sql`NOW()` };
		if (dto.title) {
			dtoFields['title'] = dto.title;
		}
		if (dto.description) {
			dtoFields['description'] = dto.description;
		}

		await this.db.db
			.update(posts)
			.set({ ...dtoFields })
			.where(eq(posts.id, postId));

		return { success: true };
	}

	public async attachFiles(postId: string, files: Express.Multer.File[]): Promise<string[]> {
		const mediaIds: string[] = [];

		for (const file of files) {
			// @TODO тест что если файл не догрузится, чтобы не стопил остальные
			try {
				const mediaId = await this.attachFile(postId, file);
				mediaIds.push(mediaId);
			} catch (error) {
				console.error(`Файл ${file.originalname} не догрузился в пост ${postId} по причине:`, error);
			}
		}

		return mediaIds;
	}

	public async attachFile(postId: string, file: Express.Multer.File): Promise<string> {
		if (!(file satisfies Express.Multer.File)) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		const mediaFilename = await this.files.uploadFile(file);
		const [media] = await this.db.db
			.insert(postMedia)
			.values({
				postId,
				mediaFilename,
			})
			.returning({ id: postMedia.id });

		return media.id;
	}

	public async detachFiles(postId: string, mediaFilenames: string[]): Promise<string[]> {
		const mediaIds: string[] = [];

		for (const filename of mediaFilenames) {
			// @TODO тест что если файл не удалится, чтобы не стопил остальные
			try {
				const mediaId = await this.detachFile(postId, filename);
				mediaIds.push(mediaId);
			} catch (error) {
				console.error(`Файл ${filename} не удалился из поста ${postId} по причине:`, error);
			}
		}

		return mediaIds;
	}

	public async detachFile(postId: string, mediaFilename: string): Promise<string> {
		// @TODO тест что если файл не догрузится, чтобы не стопил остальные
		await this.files.deleteFile(mediaFilename);
		const [mediaId] = await this.db.db
			.delete(postMedia)
			.where(and(eq(postMedia.postId, postId), eq(postMedia.mediaFilename, mediaFilename)))
			.returning({ id: postMedia.id });

		return mediaId.id;
	}

	public async unlikePost(userId: string, postId: string): Promise<CommonDto.BooleanResponse> {
		await this.db.db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

		return { success: true };
	}

	public async likePost(userId: string, postId: string): Promise<CommonDto.BooleanResponse> {
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

	public async getParticipants(
		userId: string,
		postId: string,
		page: number,
		limit: number,
	): Promise<Required<TrainingParticipantDto.Entity>[]> {
		const [post] = await this.db.db
			.select({ trainingId: posts.trainingId })
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);
		if (!post) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		// Пока что все посты закреплены за своей тренировкой
		return this.trainings.getParticipantsWithSubs(userId, post.trainingId!, page, limit);
	}

	public async deletePost(postId: string, userId: string): Promise<CommonDto.BooleanResponse> {
		const [post] = await this.db.db
			.select({ userCreatorId: posts.userCreatorId })
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);
		if (!post) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (post.userCreatorId !== userId) {
			throw new ForbiddenException(ERRORS.FORBIDDEN);
		}

		const media = await this.db.db
			.select({ mediaFilename: postMedia.mediaFilename })
			.from(postMedia)
			.where(eq(postMedia.postId, postId));

		for (const m of media) {
			try {
				// @TODO проверить ошибку тут какую будет
				await this.files.deleteFile(m.mediaFilename);
			} catch (error) {
				console.error('Ошибка файл не удалился', m.mediaFilename);
			}
		}

		await this.db.db.delete(postLikes).where(eq(postLikes.postId, postId));
		await this.db.db.delete(postMedia).where(eq(postMedia.postId, postId));
		await this.db.db.delete(posts).where(eq(posts.id, postId));

		return { success: true };
	}
}
