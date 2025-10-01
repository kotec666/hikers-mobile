import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { TokenDto } from '../token/token.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
	) {}

	/** Регистрирует нового пользователя.
	 * @returns - {@link TokenDto.TokenResponse | access-токен}
	 */
	public async registration(dto: UserDto.Creation): Promise<TokenDto.TokenResponse> {
		try {
			await this.userService.checkEmailAvailable(dto.email);

			const user = await this.userService.createUser(dto);
			return await this.tokenService.generatePairAndGetAccess(user.id);
		} catch (e) {
			throw e;
		}
	}

	/** Аутентицикация нового пользователя.
	 * @returns - {@link TokenDto.TokenResponse | access-токен}
	 */
	public async login(dto: UserDto.Login): Promise<TokenDto.TokenResponse> {
		await this.userService.checkLogin(dto);

		const user = await this.userService.getUserByEmail(dto.email);
		return await this.tokenService.generateAccessTokenByUserId(user.id);
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
