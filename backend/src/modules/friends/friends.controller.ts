import { Controller, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { FriendsService } from './friends.service';

@Controller('friends')
@UseInterceptors(UserInterceptor)
export class FriendsController {
	constructor(private readonly service: FriendsService) {}
}
