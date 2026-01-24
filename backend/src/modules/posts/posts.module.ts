import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { TrainingsModule } from '../trainings/trainings.module';

@Module({
	controllers: [PostsController],
	exports: [],
	imports: [DatabaseModule, TrainingsModule],
	providers: [PostsService],
})
export class PostsModule {}
