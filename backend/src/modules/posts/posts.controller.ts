import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User, UserData } from '../../common/decorators/user.decorator';
import { PostsService } from './posts.service';
import { PostDto } from './posts.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IsUUID } from '@validation/parameter-decorators';
import { NotNegative } from '@validation/query-decorators';

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
	 * @summary Посты из профиля пользователя
	 * @security token
	 */
	@Get('by-user/:id')
	public async getByUser(
		@IsUUID('id') @Param('id') id: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<PostDto.Entity[]> {
		return await this.service.getByUser(id, page, limit);
	}

	/**
	 * @tag Posts
	 * @summary Получить пост по id
	 * @security token
	 */
	@Get(':id')
	public async getById(@IsUUID('id') @Param('id') id: string): Promise<PostDto.Entity> {
		return await this.service.getById(id);
	}
}
