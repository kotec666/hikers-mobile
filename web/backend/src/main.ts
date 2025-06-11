import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enableCors();
	app.useStaticAssets(join(__dirname, '..', 'frontend/dist'));

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
	SwaggerModule.setup('api/docs', app, document as any, {
		explorer: true,
		customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
	});

	const host = process.env.HOST ?? 'localhost';
	const port = parseInt(process.env.PORT ?? '3000');

	await app.listen(port).then(() => {
		console.log(`Server running at: http://${host}:${port}`);
		console.log(`API docs at: http://${host}:${port}/docs`);
	});
}
bootstrap().catch((e) => {
	console.log('error:', e);
});
