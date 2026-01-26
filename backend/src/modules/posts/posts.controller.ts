import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User, UserData } from '../../common/decorators/user.decorator';
import { PostsService } from './posts.service';
import { PostDto } from './posts.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IsUUID } from '@validation/uuid.validatior';

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
		return this.service.create(user.id, { ...dto, files });
	}

	/**
	 * @tag Posts
	 * @summary Получить пост по id
	 * @security token
	 */
	@Get(':id')
	public async getById(@IsUUID('id') @Param('id') id: string): Promise<PostDto.Entity> {
		return this.service.getById(id);
	}
}
