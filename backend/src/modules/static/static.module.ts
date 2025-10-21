import { Module } from '@nestjs/common';
import { StaticService } from './static.service';
import { StaticController } from './static.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [StaticController],
	providers: [StaticService],
	exports: [StaticService],
	imports: [DatabaseModule],
})
export class StaticModule {}
