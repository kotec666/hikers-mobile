import { Controller, Res, UnauthorizedException, Req, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../user/user.dto';
import { AuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * @tag Auth
	 * @summary Регистрация. После нужно обязательное подтверждение почты
	 */
	@Post('registration')
	public async registration(@Body() dto: UserDto.Registration) {
		return this.authService.fakeRegistration(dto);
	}

	/**
	 * @tag Auth
	 * @summary Логин
	 */
	@Post('login')
	public async login(@Body() dto: UserDto.Login) {
		return this.authService.login(dto);
	}

	/**
	 * @tag Auth
	 * @summary Обновить access-token
	 * @security token
	 */
	@Post('refresh')
	public async refresh(@Req() req, @Res({ passthrough: true }) res) {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			throw new UnauthorizedException();
		}

		const token = authHeader.split(' ')[1];
		const accessToken = await this.authService.refresh({ token: token });

		res.status(200);
		return accessToken;
	}

	/**
	 * @tag Auth
	 * @summary Ввести код подтверждения почты и тем самым зарегать юзера
	 */
	@Post('confirm-email')
	public async confirmEmail(@Body() dto: AuthDto.ConfirmEmail) {
		return this.authService.confirmEmail(dto.email, dto.code);
	}

	/**
	 * @tag Auth
	 * @summary Запросить код восстановления пароля
	 */
	@Post('request-password-recovery')
	public async requestPasswordRecovery(@Body() dto: AuthDto.RequestPasswordRecovery) {
		return this.authService.requestPasswordRecovery(dto.email);
	}

	/**
	 * @tag Auth
	 * @summary Ввести код восстановления пароля
	 */
	@Post('confirm-password-recovery')
	public async confirmPasswordRecovery(@Body() dto: AuthDto.ConfirmPasswordRecovery) {
		return this.authService.confirmPasswordCode(dto.email, dto.code);
	}

	/**
	 * @tag Auth
	 * @summary Восстановить парол
	 */
	@Post('recover-password')
	public async recoverPassword(@Body() dto: AuthDto.PasswordRecovery) {
		return this.authService.recoverPassword(dto);
	}
}
