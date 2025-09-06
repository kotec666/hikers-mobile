import { Controller } from '@nestjs/common';
import { TypedRoute, TypedParam } from '@nestia/core';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
	constructor(private readonly service: TokenService) {}

	/**
	 * @tag Tokens
	 * @summary Generate new Pair (Access+Refresh) and get Access
	 */
	@TypedRoute.Post('/ar/:uid')
	async generatePair(@TypedParam('uid') userId: string) {
		return this.service.generatePairAndGetAccess(userId);
	}

	/**
	 * @tag Tokens
	 * @summary Generate only Access token (by userId) and returns it
	 */
	@TypedRoute.Post('/a/:uid')
	async generateAccess(@TypedParam('uid') userId: string) {
		return this.service.generateAccessTokenByUserId(userId);
	}

	/**
	 * @tag Tokens
	 * @summary Refreshes access token and returns a valid back. Error means user not authorized
	 */
	@TypedRoute.Patch('refresh/:token')
	async refreshAccess(@TypedParam('token') token: string) {
		return this.service.refreshAccessToken(token);
	}
}
