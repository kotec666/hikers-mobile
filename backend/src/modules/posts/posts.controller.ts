import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User, UserData } from '../../common/decorators/user.decorator';
import { PostsService } from './posts.service';
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
	public async create(@User() user: UserData, @Body() dto: PostDto.Creation): Promise<PostDto.Entity> {
		return this.service.create(user.id, dto);
	}
}
