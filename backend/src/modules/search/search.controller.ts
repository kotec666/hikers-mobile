import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { User, UserData } from '@decorators/user.decorator';
import { NotNegative } from '@validation/query-decorators';
import { SerachService } from './search.service';
import { UserDto } from '../user/user.dto';
import { PostDto } from '../posts/posts.dto';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { ParseEnum } from '@validation/parameter-decorators';
import { SearchType } from '@shared/enums';

@Controller('search')
@UseInterceptors(UserInterceptor)
export class SerachController {
	constructor(private readonly service: SerachService) {}

	/**
	 * @tag Search
	 * @summary Поиск людей или постов по тексту
	 * @security token
	 */
	@Get()
	public async search(
		@User() user: UserData,
		@ParseEnum({ key: 'type', enum: SearchType }) @Query('type') type: SearchType,
		@Query('word') word: string,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
	): Promise<Array<PostDto.SearchEntity | UserDto.Entity>> {
		return await this.service.search(user.id, type, word, page, limit);
	}
}
