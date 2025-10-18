import { Module } from '@nestjs/common';
import { StaticService } from './static.service';
import { StaticController } from './static.controller';

@Module({
	controllers: [StaticController],
	providers: [StaticService],
	exports: [StaticService],
})
export class S3Module {}
