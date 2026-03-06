import { JwtService } from '@nestjs/jwt';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TokenDto } from '../token/token.dto';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './notifications.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { parsePropertyMessages } from '../../common/filters/exceptions.filter';
import { BadRequestException } from '@nestjs/common';
import { ERRORS } from '@shared/errors';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private socketsToUserIds = new Map<Socket, string>();

	constructor(
		private readonly jwt: JwtService,
		private readonly service: NotificationsService,
	) {}

	@SubscribeMessage('notifications/pull')
	private async handlePullNotifications(
		@MessageBody() data: NotificationDto.Pull,
		@ConnectedSocket() client: Socket,
	) {
		const userId = this.getUserIdBySocket(client);
		if (!userId) {
			client.disconnect(true);
			return;
		}

		const pullInstance = plainToInstance(NotificationDto.Pull, data);
		await validate(pullInstance).then((errors) => {
			if (errors.length === 0) {
				return;
			}

			const mapped = errors.map((err) => {
				const values = Object.values(err.constraints ?? {});
				return parsePropertyMessages(values);
			});

			client.emit('errors', { message: mapped });
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		});

		const notifications = await this.service.getNotifications(userId, data.page, data.limit, false);
		client.emit('notifications', notifications);
	}

	public getUserIdBySocket(socket: Socket): string | null {
		return this.socketsToUserIds.get(socket) ?? null;
	}

	public emitToUser(userId: string, event: string, payload: unknown) {
		this.socketsToUserIds.forEach((connUserId, socket) => {
			if (userId === connUserId) {
				socket.emit(event, payload);
			}
		});
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
			this.socketsToUserIds.set(client, tokenData.id);
		} catch {
			client.disconnect(true);
		}
	}

	handleDisconnect(client: Socket) {
		this.socketsToUserIds.delete(client);
	}
}
