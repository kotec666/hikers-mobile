import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { DatabaseModule } from '../database/database.module';
import { TokenController } from './token.controller';

@Module({
	controllers: [TokenController],
	imports: [DatabaseModule],
	providers: [TokenService],
	exports: [TokenService],
})
export class TokenModule {}
