import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';

@Module({
	controllers: [],
	exports: [],
	imports: [],
	providers: [WebsocketsGateway],
})
export class WebsocketsModule {}
