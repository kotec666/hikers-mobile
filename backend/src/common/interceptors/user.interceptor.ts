import {
	CallHandler,
	ExecutionContext,
	Inject,
	Injectable,
	Logger,
	NestInterceptor,
	UnauthorizedException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../../modules/token/token.dto';
import { DatabaseService } from 'src/modules/database/database.service';
import { eq } from 'drizzle-orm';
import { users } from 'src/modules/database/schema';

@Injectable()
export class UserInterceptor implements NestInterceptor {
	private readonly logger: Logger;

	public constructor(
		@Inject() private readonly db: DatabaseService,
		@Inject() private readonly jwtService: JwtService,
	) {
		this.logger = new Logger(UserInterceptor.name);
	}

	/**
	 * Проверка авторизации пользователя interceptor.
	 * @param context
	 * @param next
	 */
	public async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();

		const authHeader = request.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			throw new UnauthorizedException();
		}
		const token = authHeader.split(' ')[1];

		try {
			const tokenData: Token.Access = await this.jwtService.verify(token);
			const [user] = await this.db.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, tokenData.id))
				.limit(1);

			if (!user) {
				throw new UnauthorizedException();
			}

			request.user = user;
			return next.handle();
		} catch (e) {
			throw new UnauthorizedException();
		}
	}
}
