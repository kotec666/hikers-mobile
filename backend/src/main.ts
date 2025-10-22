import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './common/filters/exceptions.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
	const app: INestApplication = await NestFactory.create(AppModule, {
		bufferLogs: true,
		logger: false,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);
	app.useGlobalFilters(new HttpExceptionFilter());

	app.useLogger(app.get(Logger));
	app.enableCors({
		origin: `*`,
		credentials: true,
		methods: '*',
	});

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	const logger = app.get(Logger);
	const port = parseInt(process.env.PORT ?? '3000');

	const document = await NestiaSwaggerComposer.document(app, {
		openapi: '3.1',
		info: {
			title: 'Hikers | Backend',
			description: 'Hikers Open Api',
			license: {
				name: 'Internal testing',
			},
		},
		security: {
			token: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		servers: [
			{
				url: process.env.SWAGGER_BACKEND_URL as string,
				description: 'Main server',
			},
		],
	});
	const theme = new SwaggerTheme();
	SwaggerModule.setup('docs', app, document as any, {
		explorer: true,
		customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
	});

	await app.listen(port);
	logger.log(`
-----------------------------------------------------------
Application is running on: http://localhost:${port}
Documentation is available on: http://localhost:${port}/docs
-----------------------------------------------------------
`);
}

bootstrap();
