import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { StaticModule } from '../static/static.module';

@Module({
	controllers: [PostsController],
	exports: [],
	imports: [DatabaseModule, TrainingsModule, StaticModule],
	providers: [PostsService],
})
export class PostsModule {}
