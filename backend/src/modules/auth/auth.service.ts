import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ERRORS } from '@shared/errors';
import { UserDto } from '../user/user.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { TokenDto } from '../token/token.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { DatabaseService } from '../database/database.service';
import { MailerService } from '../mailer/mailer.service';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { generateNumericCode } from './helpers';
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@shared/constants';

@Injectable()
export class AuthService {
	constructor(
		private readonly db: DatabaseService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly mailer: MailerService,
	) {}

	public async requestConfirmEmail(userId: string): Promise<CommonDto.BooleanResponse> {
		// @TODO проверка с кеша по ттл чтобы не спамили

		const [user] = await this.db.db
			.select({
				id: users.id,
				email: users.email,
				emailConfirmedAt: users.emailConfirmedAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (user.emailConfirmedAt) {
			throw new ConflictException(ERRORS.ALREADY_EXISTS);
		}

		const code = generateNumericCode(EMAIL_CONFIRMATION_CODE_SIZE);
		// @TODO время жизни кода, закидывать в кеш после отправки

		return this.mailer
			.sendEmailConfirmationMail(user.email, code)
			.catch(() => ({
				success: false,
			}))
			.then(() => ({
				success: true,
			}));
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async confirmEmail(userId: string, code: string): Promise<CommonDto.BooleanResponse> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				email: users.email,
				emailConfirmedAt: users.emailConfirmedAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (user.emailConfirmedAt) {
			throw new ConflictException(ERRORS.ALREADY_EXISTS);
		}

		// @TODO доставать код из кэша, сравнивать, кидать ошибку или обновлять поле юзера
		return { success: true };
	}

	public async registration(dto: UserDto.Registration): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		try {
			await this.userService.checkEmailAvailable(dto.email);

			const user = await this.userService.createUser(dto);
			const { token } = await this.tokenService.generatePairAndGetAccess(user.id);
			return { ...user, token };
		} catch (e: any) {
			if (e.message === ERRORS.ALREADY_EXISTS) {
				throw new BadRequestException(`_email:${ERRORS.ALREADY_EXISTS}`);
			}
			throw e;
		}
	}

	public async login(dto: UserDto.Login): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		try {
			const user = await this.userService.getUserByEmailAndPassword(dto);
			const { token } = await this.tokenService.generateAccessTokenByUserId(user.id);

			return { ...user, token };
		} catch (e: any) {
			if (e.message === ERRORS.NOT_FOUND) {
				throw new NotFoundException(`_email:${ERRORS.NOT_FOUND}`);
			}
			if (e.message === ERRORS.MISMATCH) {
				throw new BadRequestException(`_password:${ERRORS.MISMATCH}`);
			}

			throw e;
		}
	}

	/** Перевыдает истекший access-токен.
	 * @throws - {@link UnauthorizedException} если токен не валидный
	 */
	public async refresh(expiredAccessToken: TokenDto.TokenResponse): Promise<TokenDto.TokenResponse> {
		try {
			return await this.tokenService.refreshAccessToken(expiredAccessToken.token);
		} catch (e) {
			throw new UnauthorizedException();
		}
	}
}
