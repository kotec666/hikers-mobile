import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { TokenDto } from '../token/token.dto';
import { ERRORS } from '@shared/errors';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	/** Регистрирует нового пользователя.
	 * @returns - {@link TokenDto.TokenResponse | access-токен}
	 */
	public async registration(dto: UserDto.Registration): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		try {
			await this.userService.checkEmailAvailable(dto.email);

			const user = await this.userService.createUser(dto);
			const { token } = await this.tokenService.generatePairAndGetAccess(user.id);
			return { ...user, token };
		} catch (e) {
			if (e.message === ERRORS.ALREADY_EXISTS) {
				throw new BadRequestException(`_email:${ERRORS.ALREADY_EXISTS}`);
			}
			throw e;
		}
	}

	/** Аутентицикация нового пользователя.
	 * @returns - {@link TokenDto.TokenResponse | access-токен}
	 */
	public async login(dto: UserDto.Login): Promise<TokenDto.TokenResponse & UserDto.Entity> {
		await this.userService.checkLogin(dto);

		try {
			const user = await this.userService.getUserByEmail(dto.email);
			const { token } = await this.tokenService.generateAccessTokenByUserId(user.id);

			return { ...user, token };
		} catch (e) {
			if (e.message === ERRORS.ALREADY_EXISTS) {
				throw new NotFoundException(`_email:${ERRORS.NOT_FOUND}`);
			}
			throw e;
		}
	}

	/** Перевыдает истекший access-токен.
	 * @throws - {@link UnauthorizedException} если токен не валидный
	 * @returns - {@link TokenDto.TokenResponse | свежий access-токен}
	 */
	public async refresh(expiredAccessToken: TokenDto.TokenResponse) {
		try {
			return await this.tokenService.refreshAccessToken(expiredAccessToken.token);
		} catch (e) {
			throw new UnauthorizedException();
		}
	}
}
