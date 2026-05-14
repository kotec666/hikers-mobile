import { Controller, Res, UnauthorizedException, Req, Body, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../user/user.dto';
import { AuthDto } from './auth.dto';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User, UserData } from '@decorators/user.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * @tag Auth
	 * @summary Регистрация
	 */
	@Post('registration')
	public async registration(@Body() dto: UserDto.Registration, @Res({ passthrough: true }) res) {
		const accessToken = await this.authService.registration(dto);

		res.status(201);
		return accessToken;
	}

	/**
	 * @tag Auth
	 * @summary Логин
	 */
	@Post('login')
	public async login(@Body() dto: UserDto.Login, @Res({ passthrough: true }) res) {
		const accessToken = await this.authService.login(dto);

		res.status(200);
		return accessToken;
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
	 * @summary Запросить код подтверждения почты
	 * @security token
	 */
	@UseInterceptors(UserInterceptor)
	@Post('request-confirm-email')
	public async requestConfirmEmail(@User() user: UserData) {
		return this.authService.requestConfirmEmail(user.id);
	}

	/**
	 * @tag Auth
	 * @summary Ввести код подтверждения почты
	 * @security token
	 */
	@UseInterceptors(UserInterceptor)
	@Post('confirm-email')
	public async confirmEmail(@User() user: UserData, @Body() dto: AuthDto.ConfirmEmail) {
		return this.authService.confirmEmail(user.id, dto.code);
	}
}
