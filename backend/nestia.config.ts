import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    return app;
  },
  output: '../frontend/src/api/generated',
  clone: true,
  propagate: true,
};
export default NESTIA_CONFIG;
