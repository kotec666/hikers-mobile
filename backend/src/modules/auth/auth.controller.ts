import { Controller, Res, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../user/user.dto';
import { TypedRoute, TypedBody } from '@nestia/core';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * @tag Auth
	 * @summary Register user
	 * @description Creates a new user and returns an access token
	 */
	@TypedRoute.Post('registration')
	public async registration(@TypedBody() dto: UserDto.Creation, @Res({ passthrough: true }) res) {
		const accessToken = await this.authService.registration(dto);

		res.status(201);
		return accessToken;
	}

	/**
	 * @tag Auth
	 * @summary Authenticates a user and returns an access token
	 */
	@TypedRoute.Post('login')
	public async login(@TypedBody() dto: UserDto.Login, @Res({ passthrough: true }) res) {
		const accessToken = await this.authService.login(dto);

		res.status(200);
		return accessToken;
	}

	/**
	 * @tag Auth
	 * @summary Refresh access-token
	 * @security token
	 */
	@TypedRoute.Post('refresh')
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
}
