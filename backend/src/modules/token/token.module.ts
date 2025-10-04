import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	controllers: [],
	imports: [DatabaseModule],
	providers: [TokenService],
	exports: [TokenService],
})
export class TokenModule {}
