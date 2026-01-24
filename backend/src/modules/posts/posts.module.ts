import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [PostsController],
	exports: [],
	imports: [DatabaseModule],
	providers: [PostsService],
})
export class PostsModule {}
