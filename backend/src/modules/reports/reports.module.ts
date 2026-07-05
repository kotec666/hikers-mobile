import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from '../database/database.module';
import { ReportsService } from './reports.service';
import { StaticModule } from '../static/static.module';

@Module({
	controllers: [ReportsController],
	providers: [ReportsService],
	imports: [DatabaseModule, StaticModule],
	exports: [],
})
export class ReportsModule {}
