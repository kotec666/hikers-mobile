import { Module } from '@nestjs/common';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [TrainingsController],
	exports: [TrainingsService],
	imports: [DatabaseModule],
	providers: [TrainingsService],
})
export class TrainingsModule {}
