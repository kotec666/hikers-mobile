import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { TrainingsModule } from '../trainings/trainings.module';
import { StaticModule } from '../static/static.module';
import { SubscribersModule } from '../subscribers/subscribers.module';

@Module({
	controllers: [PostsController],
	exports: [],
	imports: [DatabaseModule, StaticModule, TrainingsModule, SubscribersModule],
	providers: [PostsService],
})
export class PostsModule {}
