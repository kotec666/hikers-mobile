import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { ERRORS } from '@shared/errors';
import {
	EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS,
	EMAIL_CONFIRMATION_CODE_SIZE,
	EMAIL_CONFIRMATION_CODE_TTL_MS,
} from '@shared/constants';
import { generateNumericCode } from './helpers';
import { UserDto } from '../user/user.dto';
import { CommonDto } from '../../common/dto/common.dto';
import { TokenDto } from '../token/token.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { DatabaseService } from '../database/database.service';
import { MailerService } from '../mailer/mailer.service';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
	constructor(
		private readonly db: DatabaseService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly mailer: MailerService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private getConfirmationKey(userId: string): string {
		return `conf:${userId}`;
	}

	private getConfirmationRateLimitKey(userId: string): string {
		return `conf:${userId}:rate_limit`;
	}

	public async requestConfirmEmail(userId: string): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getConfirmationKey(userId);
		const rateLimitKey = this.getConfirmationRateLimitKey(userId);

		const rateLimit = await this.cacheManager.get<string>(rateLimitKey);
		if (rateLimit) {
			throw new ConflictException(ERRORS.TOO_MANY_REQUESTS);
		}

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
		await this.cacheManager.set(cachedCodeKey, code, EMAIL_CONFIRMATION_CODE_TTL_MS);
		await this.cacheManager.set(rateLimitKey, true, EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS);

		return this.mailer
			.sendEmailConfirmationMail(user.email, code)
			.catch(() => ({
				success: false,
			}))
			.then(() => ({
				success: true,
			}));
	}

	public async confirmEmail(userId: string, code: string): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getConfirmationKey(userId);

		const cachedCode = await this.cacheManager.get<string>(cachedCodeKey);
		if (!cachedCode) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (cachedCode !== code) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		return this.db.db
			.update(users)
			.set({
				emailConfirmedAt: new Date(),
			})
			.where(eq(users.id, userId))
			.catch(() => ({
				success: false,
			}))
			.then(() => {
				this.cacheManager.del(cachedCodeKey);

				return { success: true };
			});
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
