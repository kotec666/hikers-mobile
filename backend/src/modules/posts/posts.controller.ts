import { Controller, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { PostsService } from './posts.service';

@Controller('posts')
@UseInterceptors(UserInterceptor)
export class PostsController {
	constructor(private readonly service: PostsService) {}
}
