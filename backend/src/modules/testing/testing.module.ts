import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { DatabaseModule } from '../database/database.module';
import { TestingController } from './testing.controller';

@Module({
	controllers: [TestingController],
	imports: [DatabaseModule],
	providers: [TestingService],
	exports: [TestingService],
})
export class TestingModule {}
