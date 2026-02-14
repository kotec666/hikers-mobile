import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User, UserData } from '../../common/decorators/user.decorator';
import { CommonDto } from '../../common/dto/common.dto';
import { PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IsUUID } from '@validation/parameter-decorators';
import { NotNegative } from '@validation/query-decorators';
import { TrainingParticipantDto } from '../trainings/trainings.dto';
import { PostDto } from './posts.dto';

@Controller('posts')
@UseInterceptors(UserInterceptor)
export class PostsController {
	constructor(private readonly service: PostsService) {}

	/**
	 * @tag Posts
	 * @summary Создать пост по тренировке
	 * @security token
	 */
	@Post()
	@UseInterceptors(FilesInterceptor('files'))
	public async create(
		@User() user: UserData,
		@Body() dto: PostDto.Creation,
		@UploadedFiles() files: Array<Express.Multer.File>,
	): Promise<PostDto.Entity> {
		return await this.service.create(user.id, { ...dto, files });
	}

	/**
	 * @tag Posts
	 * @summary Лента постов
	 * @security token
	 */
	@Get('feed')
	public async getFeed(
		@User() user: UserData,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<PostDto.Entity[]> {
		return await this.service.getFeed(user.id, page, limit);
	}

	/**
	 * @tag Posts
	 * @summary Посты из чужого профиля
	 * @security token
	 */
	@Get('by-user/:id')
	public async getByUser(
		@User() user: UserData,
		@IsUUID('id') @Param('id') id: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<PostDto.Entity[]> {
		return await this.service.getByUser(user.id, id, page, limit);
	}

	/**
	 * @tag Posts
	 * @summary Посты из профиля пользователя
	 * @security token
	 */
	@Get('my')
	public async getMy(
		@User() user: UserData,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<PostDto.Entity[]> {
		return await this.service.getByUser(user.id, user.id, page, limit);
	}

	/**
	 * @tag Posts
	 * @summary Получить пост по id
	 * @security token
	 */
	@Get(':id')
	public async getById(@User() user: UserData, @IsUUID('id') @Param('id') id: string): Promise<PostDto.Entity> {
		return await this.service.getById(user.id, id);
	}

	/**
	 * @tag Posts
	 * @summary Удалить пост
	 * @security token
	 */
	@Delete(':id')
	public async deletePost(
		@User() user: UserData,
		@IsUUID('id') @Param('id') id: string,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.deletePost(id, user.id);
	}

	/**
	 * @tag Posts
	 * @summary Поставить лайк пост
	 * @security token
	 */
	@Post(':id/like')
	public async like(
		@User() user: UserData,
		@IsUUID('id') @Param('id') id: string,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.likePost(user.id, id);
	}

	/**
	 * @tag Posts
	 * @summary Убрать лайк с поста
	 * @security token
	 */
	@Post(':id/unlike')
	public async unlike(
		@User() user: UserData,
		@IsUUID('id') @Param('id') id: string,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.unlikePost(user.id, id);
	}

	/**
	 * @tag Posts
	 * @summary Участники поста
	 * @security token
	 */
	@Get(':id/participants')
	public async getParticipants(
		@IsUUID('id') @Param('id') id: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<TrainingParticipantDto.Entity[]> {
		return await this.service.getParticipants(id, page, limit);
	}
}
