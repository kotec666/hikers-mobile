import { Module } from '@nestjs/common';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { DatabaseService } from '../database/database.service';

@Module({
	controllers: [TrainingsController],
	exports: [TrainingsService],
	imports: [DatabaseService],
	providers: [TrainingsService],
})
export class TrainingsModule {}
