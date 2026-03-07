import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenDto } from '../token/token.dto';

@WebSocketGateway()
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private static socketsToUserIds = new Map<Socket, string>();

	constructor(private readonly jwt: JwtService) {}

	public static getUserIdBySocket(socket: Socket): string | null {
		return WebsocketsGateway.socketsToUserIds.get(socket) ?? null;
	}

	/** Отправить ws-сообщение юзеру.
	 * @returns boolean - было ли отправлено сообщение
	 */
	public static emitToUser(userId: string, event: string, payload: unknown): boolean {
		let wasSent = false;
		WebsocketsGateway.socketsToUserIds.forEach((connUserId, socket) => {
			if (userId === connUserId) {
				socket.emit(event, payload);
				wasSent = true;
			}
		});

		return wasSent;
	}

	handleConnection(client: Socket) {
		const rawToken = client.handshake.query.auth;
		if (!rawToken) {
			client.disconnect(true);
			return;
		}
		try {
			const token = String(rawToken).split(' ')[1];
			const tokenData: TokenDto.Access = this.jwt.verify(String(token));
			WebsocketsGateway.socketsToUserIds.set(client, tokenData.id);
		} catch {
			client.disconnect(true);
		}
	}

	handleDisconnect(client: Socket) {
		WebsocketsGateway.socketsToUserIds.delete(client);
	}
}
