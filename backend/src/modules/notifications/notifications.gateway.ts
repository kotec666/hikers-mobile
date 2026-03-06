import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayConnection {
	handleConnection(client: Socket) {
		console.log('hello', client.id);
	}
}
