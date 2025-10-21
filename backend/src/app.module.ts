import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './modules/database/database.module';
import { defaultEnv } from './modules/env/env.validation';
import { EnvService } from './modules/env/env.service';
import { EnvModule } from './modules/env/env.module';
import { StaticModule } from './modules/static/static.module';
import { TokenModule } from './modules/token/token.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { UniqueEmailValidator } from '@validation/unique-email.validator';
import { FriendsModule } from './modules/friends/friends.module';
import { SubscribersModule } from './modules/subscribers/subscribers.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ProfileModule } from './modules/profile/profile.module';

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
		LoggerModule.forRoot({
			pinoHttp: {
				autoLogging: false,
				level: process.env.NODE_ENV === 'prod' ? 'info' : 'debug',
				levelVal: 8,
				transport:
					process.env.NODE_ENV === 'prod'
						? undefined
						: {
								target: 'pino-pretty',
								options: {
									singleLine: true,
									colorize: true,
									translateTime: 'SYS:standard',
								},
							},
				serializers: {
					req: (req) => ({
						method: req.method,
						url: req.url,
						id: req.id,
					}),
					res: (res) => ({
						statusCode: res.statusCode,
					}),
				},
			},
		}),
		DatabaseModule,
		StaticModule,
		TokenModule,
		AuthModule,
		UserModule,
		AchievementsModule,
		FriendsModule,
		SubscribersModule,
		ActivitiesModule,
		ProfileModule,
	],
	providers: [UniqueEmailValidator],
})
export class AppModule {}
