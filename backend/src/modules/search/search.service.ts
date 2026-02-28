import { BadRequestException, Injectable } from '@nestjs/common';
import { PostDto } from '../posts/posts.dto';
import { UserDto } from '../user/user.dto';
import { PostsService } from '../posts/posts.service';
import { ERRORS } from '@shared/errors';
import { UserService } from '../user/user.service';

@Injectable()
export class SerachService {
	constructor(
		private readonly posts: PostsService,
		private readonly users: UserService,
	) {}

	public async search(
		userId: string,
		type: 'posts' | 'users',
		word: string,
		page: number,
		limit: number,
	): Promise<Array<PostDto.SearchEntity | UserDto.Entity>> {
		switch (type) {
			case 'posts': {
				return this.posts.search(userId, page, limit, word);
			}
			case 'users': {
				return this.users.search(userId, page, limit, word);
			}
			default:
				throw new BadRequestException(`_type:${ERRORS.MISMATCH}`);
		}
	}
}
