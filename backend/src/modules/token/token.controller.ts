import { Controller, Param, Patch, Post } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
	constructor(private readonly service: TokenService) {}

	/**
	 * @tag Tokens
	 * @summary Generate new Pair (Access+Refresh) and get Access
	 */
	@Post('/ar/:uid')
	async generatePair(@Param('uid') userId: string) {
		return this.service.generatePairAndGetAccess(userId);
	}

	/**
	 * @tag Tokens
	 * @summary Generate only Access token (by userId) and returns it
	 */
	@Post('/a/:uid')
	async generateAccess(@Param('uid') userId: string) {
		return this.service.generateAccessTokenByUserId(userId);
	}

	/**
	 * @tag Tokens
	 * @summary Refreshes access token and returns a valid back. Error means user not authorized
	 */
	@Patch('refresh/:token')
	async refreshAccess(@Param('token') token: string) {
		return this.service.refreshAccessToken(token);
	}
}
