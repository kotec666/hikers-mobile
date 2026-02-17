import { Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { User, UserData } from '@decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { IsUUID } from '@validation/parameter-decorators';
import { NotNegative } from '@validation/query-decorators';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { TrainingParticipantDto } from '../trainings/trainings.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { PostDto } from './posts.dto';
import { TokenDto } from '../token/token.dto';
import { BodyWithFiles } from '@validation/param.decorators';
import { MAX_FILE_SIZE_MEGABYTES, POST_MAX_FILES_COUNT } from '@shared/constants';

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
	@UseInterceptors(
		FilesInterceptor('files', POST_MAX_FILES_COUNT, {
			limits: {
				fileSize: MAX_FILE_SIZE_MEGABYTES * 1024 * 1024,
			},
		}),
	)
	public async create(@User() user: UserData, @BodyWithFiles() dto: PostDto.Creation): Promise<any> {
		return await this.service.create(user.id, dto);
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
	 * @summary Редактирование поста по id
	 * @security token
	 */
	@Patch(':id')
	@UseInterceptors(
		FilesInterceptor('files', POST_MAX_FILES_COUNT, {
			limits: {
				fileSize: MAX_FILE_SIZE_MEGABYTES * 1024 * 1024,
			},
		}),
	)
	public async edit(
		@IsUUID('id') @Param('id') id: string,
		@User() user: UserData,
		@BodyWithFiles() dto: PostDto.Edit,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.edit(id, user.id, dto);
	}

	/**
	 * @tag Posts
	 * @summary Удалить пост по id
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
		@User() user: TokenDto.Payload,
		@IsUUID('id') @Param('id') id: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<Required<TrainingParticipantDto.Entity>[]> {
		return await this.service.getParticipants(user.id, id, page, limit);
	}
}
