import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenDto } from '../token/token.dto';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private socketsToUserIds = new Map<Socket, string>();

	constructor(private readonly jwt: JwtService) {}

	handleConnection(client: Socket) {
		const rawToken = client.handshake.query.auth;
		if (!rawToken) {
			client.disconnect(true);
			return;
		}

		try {
			const token = String(rawToken).split(' ')[1];
			const tokenData: TokenDto.Access = this.jwt.verify(String(token));

			this.socketsToUserIds.set(client, tokenData.id);
		} catch {
			client.disconnect(true);
		}
	}

	handleDisconnect(client: Socket) {
		this.socketsToUserIds.delete(client);
	}

	public emitToUser(userId: string, event: string, payload: unknown) {
		this.socketsToUserIds.forEach((connUserId, socket) => {
			if (userId === connUserId) {
				socket.emit(event, payload);
			}
		});
	}
}
