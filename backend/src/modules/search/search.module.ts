import { Module } from '@nestjs/common';
import { SerachController } from './search.controller';
import { SerachService } from './search.service';
import { PostsModule } from '../posts/posts.module';
import { UserModule } from '../user/user.module';

@Module({
	controllers: [SerachController],
	exports: [],
	imports: [PostsModule, UserModule],
	providers: [SerachService],
})
export class SerachModule {}
