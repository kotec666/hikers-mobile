import { Module } from '@nestjs/common';
import { SubscribersController } from './subscribers.controller';
import { SubscribersService } from './subscribers.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [SubscribersController],
	exports: [SubscribersService],
	imports: [DatabaseModule],
	providers: [SubscribersService],
})
export class SubscribersModule {}
