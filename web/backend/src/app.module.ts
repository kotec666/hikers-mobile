import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './modules/database/database.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { defaultEnv } from './modules/env/env.validation';
import { EnvService } from './modules/env/env.service';
import { EnvModule } from './modules/env/env.module';

@Module({
  imports: [
    EnvModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: (env: Record<string, unknown>) => defaultEnv.parse(env),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('SECRET_KEY'),
      }),
    }),

    DatabaseModule,
    FeedbackModule,
  ],
})
export class AppModule {}
