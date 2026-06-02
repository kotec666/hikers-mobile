import {
	BadGatewayException,
	BadRequestException,
	ConflictException,
	ForbiddenException,
	HttpException,
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
	MAX_PASSWORD_RECOVERY_ATTEMPTS,
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

	private getRegistrationKey(email: string): string {
		return `reg:${email}`;
	}

	private getPasswordRecoveryKey(email: string): string {
		return `passw:${email}`;
	}

	private getPasswordRecoveryRateLimitKey(email: string): string {
		return `passw:${email}:rate_limit`;
	}

	private getEmailConfirmationKey(email: string): string {
		return `conf:${email}`;
	}

	private getEmailConfirmationRateLimitKey(email: string): string {
		return `conf:${email}:rate_limit`;
	}

	public async requestPasswordRecovery(email: string): Promise<CommonDto.RateLimited<CommonDto.BooleanResponse>> {
		const cachedCodeKey = this.getPasswordRecoveryKey(email);
		const rateLimitKey = this.getPasswordRecoveryRateLimitKey(email);

		const rateLimitSince = await this.cacheManager.get<number>(rateLimitKey);
		if (rateLimitSince) {
			throw new HttpException(
				{
					statusCode: 429,
					success: false,
					waitMs: rateLimitSince + PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS - Date.now(),
				},
				429,
			);
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
		await this.cacheManager.set(rateLimitKey, Date.now(), PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS);

		return this.mailer
			.sendPasswordRecoveryMail(user.email, code)
			.catch(() => {
				throw new BadGatewayException({
					success: false,
					waitMs: PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS,
				});
			})
			.then(() => ({
				success: true,
				waitMs: PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS,
			}));
	}

	public async confirmPasswordCode(
		email: string,
		code: string,
	): Promise<CommonDto.RateLimited<CommonDto.BooleanResponse>> {
		const cachedCodeKey = this.getPasswordRecoveryKey(email);
		const payload = await this.cacheManager.get<IPasswordRecoveryCachePayload>(cachedCodeKey);
		if (!payload) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (payload.attempts >= MAX_PASSWORD_RECOVERY_ATTEMPTS) {
			const rateLimitKey = this.getPasswordRecoveryRateLimitKey(email);
			const existingLimit = await this.cacheManager.get<number>(rateLimitKey);
			if (existingLimit) {
				throw new HttpException(
					{
						statusCode: 429,
						success: false,
						remainAttempts: 0,

						waitMs: existingLimit + PASSWORD_RECOVERY_CODE_TIMEOUT_MS - Date.now(),
					},
					429,
				);
			}

			await this.cacheManager.set(rateLimitKey, Date.now(), PASSWORD_RECOVERY_CODE_TIMEOUT_MS);

			throw new HttpException(
				{
					statusCode: 429,
					success: false,
					remainAttempts: 0,

					waitMs: PASSWORD_RECOVERY_CODE_TIMEOUT_MS,
				},
				429,
			);
		}

		const shouldConfirm = payload.code === code;
		this.cacheManager
			.set<IPasswordRecoveryCachePayload>(
				cachedCodeKey,
				{
					code: payload.code,
					attempts: shouldConfirm ? payload.attempts : payload.attempts + 1,
					confirmed: shouldConfirm,
				},
				PASSWORD_RECOVERY_CODE_TTL_MS,
			)
			.catch((r) => {
				console.log('Failed to increment password recovery attempts. Reason:', r);
			});

		if (shouldConfirm) {
			return {
				success: true,
				remainAttempts: MAX_PASSWORD_RECOVERY_ATTEMPTS - payload.attempts,
				waitMs: 0,
			};
		} else {
			throw new BadRequestException({
				success: false,
				remainAttempts: MAX_PASSWORD_RECOVERY_ATTEMPTS - (payload.attempts + 1),
				waitMs: 0,
			});
		}
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
		if (dto.password !== dto.confirmPassword) {
			throw new BadRequestException(`_confirmPassword:${ERRORS.MISMATCH}`);
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

	public async fakeRegistration(
		dto: UserDto.Registration,
	): Promise<CommonDto.RateLimited<CommonDto.BooleanResponse>> {
		if (!dto.isTermsAccepted) {
			throw new BadRequestException(`_isTermsAccepted:${ERRORS.BAD_REQUEST}`);
		}

		const cachedCodeKey = this.getEmailConfirmationKey(dto.email);
		const rateLimitKey = this.getEmailConfirmationRateLimitKey(dto.email);

		const rateLimitSince = await this.cacheManager.get<number>(rateLimitKey);
		if (rateLimitSince) {
			throw new HttpException(
				{
					statusCode: 429,
					success: false,
					waitMs: rateLimitSince + EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS - Date.now(),
				},
				429,
			);
		}

		const [user] = await this.db.db
			.select({
				id: users.id,
				email: users.email,
				emailConfirmedAt: users.emailConfirmedAt,
			})
			.from(users)
			.where(eq(users.email, dto.email))
			.limit(1);
		if (user) {
			throw new ConflictException(ERRORS.EMAIL_ALREADY_CONFIRMED);
		}

		const isEmailValid = await this.mailer.isDeliverable(dto.email);
		if (!isEmailValid) {
			throw new BadRequestException(ERRORS.INVALID_EMAIL);
		}

		const code = generateNumericCode(EMAIL_CONFIRMATION_CODE_SIZE);
		await this.cacheManager.set(cachedCodeKey, code, EMAIL_CONFIRMATION_CODE_TTL_MS);
		await this.cacheManager.set(rateLimitKey, Date.now(), EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS);

		const key = this.getRegistrationKey(dto.email);
		await this.cacheManager.set(key, dto, EMAIL_CONFIRMATION_CODE_TTL_MS);

		return this.mailer
			.sendEmailConfirmationMail(dto.email, code)
			.catch(() => {
				throw new BadGatewayException({
					success: false,
					waitMs: EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS,
				});
			})
			.then(() => ({
				success: true,
				waitMs: EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS,
			}));
	}

	public async confirmEmail(email: string, code: string): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		const cachedCodeKey = this.getEmailConfirmationKey(email);
		const cachedCode = await this.cacheManager.get<string>(cachedCodeKey);
		if (!cachedCode) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}
		if (cachedCode !== code) {
			throw new BadRequestException(`_code:${ERRORS.MISMATCH}`);
		}

		const regKey = this.getRegistrationKey(email);
		const regPayload = await this.cacheManager.get<UserDto.Registration>(regKey);
		if (!regPayload) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return this.registrationAfterConfirmation(regPayload).then((data) => {
			this.cacheManager.del(cachedCodeKey);
			this.cacheManager.del(regKey);

			return data;
		});
	}

	public async registrationAfterConfirmation(
		dto: UserDto.Registration,
	): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		if (!dto.isTermsAccepted) {
			throw new BadRequestException(`_isTermsAccepted:${ERRORS.BAD_REQUEST}`);
		}

		try {
			const user = await this.userService.createUser(dto);
			const { token } = await this.tokenService.generatePairAndGetAccess(user.id);
			return { ...user, token };
		} catch (e: any) {
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
