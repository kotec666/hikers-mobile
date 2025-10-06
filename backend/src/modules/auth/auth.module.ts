import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [TokenModule, UserModule],
})
export class AuthModule {}
