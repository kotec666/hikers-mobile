import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
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
	PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS,
	PASSWORD_RECOVERY_CODE_SIZE,
	PASSWORD_RECOVERY_CODE_TIMEOUT_MS,
	PASSWORD_RECOVERY_CODE_TTL_MS,
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
import { AuthDto } from './auth.dto';

const MAX_PASSWORD_RECOVERY_ATTEMPTS = 5;

interface IPasswordRecoveryCachePayload {
	code: string;
	attempts: number;
	confirmed: boolean;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly db: DatabaseService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly mailer: MailerService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private getPasswordRecoveryKey(email: string): string {
		return `passw:${email}`;
	}

	private getPasswordRecoveryRateLimitKey(email: string): string {
		return `passw:${email}:rate_limit`;
	}

	private getEmailConfirmationKey(userId: string): string {
		return `conf:${userId}`;
	}

	private getEmailConfirmationRateLimitKey(userId: string): string {
		return `conf:${userId}:rate_limit`;
	}

	public async requestPasswordRecovery(email: string): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getPasswordRecoveryKey(email);
		const rateLimitKey = this.getPasswordRecoveryRateLimitKey(email);

		const rateLimit = await this.cacheManager.get<boolean>(rateLimitKey);
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
			.where(eq(users.email, email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(`_email:${ERRORS.NOT_FOUND}`);
		}

		const code = generateNumericCode(PASSWORD_RECOVERY_CODE_SIZE);
		const payload: IPasswordRecoveryCachePayload = {
			code,
			attempts: 0,
			confirmed: false,
		};
		await this.cacheManager.set(cachedCodeKey, payload, PASSWORD_RECOVERY_CODE_TTL_MS);
		await this.cacheManager.set(rateLimitKey, true, PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS);

		return this.mailer
			.sendPasswordRecoveryMail(user.email, code)
			.catch(() => ({
				success: false,
			}))
			.then(() => ({
				success: true,
			}));
	}

	public async confirmPasswordCode(email: string, code: string): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getPasswordRecoveryKey(email);
		const payload = await this.cacheManager.get<IPasswordRecoveryCachePayload>(cachedCodeKey);
		if (!payload) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (payload.attempts > MAX_PASSWORD_RECOVERY_ATTEMPTS) {
			const rateLimitKey = this.getPasswordRecoveryRateLimitKey(email);
			this.cacheManager.set(rateLimitKey, true, PASSWORD_RECOVERY_CODE_TIMEOUT_MS);

			throw new ConflictException(ERRORS.TOO_MANY_REQUESTS);
		}

		const shouldConfirm = payload.code === code;
		this.cacheManager
			.set<IPasswordRecoveryCachePayload>(
				cachedCodeKey,
				{
					code: payload.code,
					attempts: payload.attempts + 1,
					confirmed: shouldConfirm,
				},
				PASSWORD_RECOVERY_CODE_TTL_MS,
			)
			.catch((r) => {
				console.log('Failed to increment password recovery attempts. Reason:', r);
			});

		if (!shouldConfirm) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		return { success: true };
	}

	public async recoverPassword(dto: AuthDto.PasswordRecovery): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getPasswordRecoveryKey(dto.email);
		const rateLimitKey = this.getPasswordRecoveryRateLimitKey(dto.email);

		const payload = await this.cacheManager.get<IPasswordRecoveryCachePayload>(cachedCodeKey);
		if (!payload) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (!payload.confirmed || payload.code !== dto.code) {
			throw new ForbiddenException(ERRORS.FORBIDDEN);
		}

		try {
			await this.userService.changePassword(dto.email, dto.password, true);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw new BadRequestException(`_password:${ERRORS.SHOULD_BE_DIFFERENT}`);
			}
			throw error;
		}

		this.cacheManager.del(cachedCodeKey);
		this.cacheManager.del(rateLimitKey);

		return { success: true };
	}

	public async requestConfirmEmail(userId: string): Promise<CommonDto.BooleanResponse> {
		const cachedCodeKey = this.getEmailConfirmationKey(userId);
		const rateLimitKey = this.getEmailConfirmationRateLimitKey(userId);

		const rateLimit = await this.cacheManager.get<boolean>(rateLimitKey);
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
		const cachedCodeKey = this.getEmailConfirmationKey(userId);

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
		if (!dto.termsAccepted) {
			throw new BadRequestException(`_termsAccepted:${ERRORS.BAD_REQUEST}`);
		}

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
