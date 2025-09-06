import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { Token } from './token.dto';
import { EnvService } from '../../modules/env/env.service';
import { DatabaseService } from '../database/database.service';
import { tokens, users } from '../database/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly db: DatabaseService,
		private readonly envService: EnvService,
	) {}

	private hashSeed(seed: Buffer): string {
		return crypto.createHash('sha256').update(seed).digest('hex');
	}

	/**
	 * Генерирует пару токенов (access и refresh) для указанного пользователя.
	 * @param userId - ID пользователя.
	 * @returns Возвращает access-токен.
	 *
	 * @throws Error при внутренней ошибке
	 */
	async generatePairAndGetAccess(userId: string): Promise<Token.TokenResponse> {
		// рандомный сид для идентификации будущей пары access & refresh токенов
		const seed = crypto.randomBytes(16);

		// Преобразование в 16ти-р строку - эта часть пойдет в приватный токен (refreshToken)
		const seedHex = seed.toString('hex');
		// Хеширование сида - эта часть пойдет в публичный токен (accessToken)
		const hashedSeed = this.hashSeed(seed);

		try {
			const [payload]: Token.Payload[] = await this.db.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			const accessToken = this.jwtService.sign(
				{
					...payload,
					hs: hashedSeed,
				},
				{ expiresIn: this.envService.get('ACCESS_TOKEN_EXPIRATION_TIME') },
			);
			const refreshToken = this.jwtService.sign(
				{
					...payload,
					s: seedHex,
				},
				{ expiresIn: this.envService.get('REFRESH_TOKEN_EXPIRATION_TIME') },
			);

			await this.db.db
				.insert(tokens)
				.values({ refreshToken, userId })
				.onConflictDoUpdate({
					target: tokens.userId,
					set: {
						refreshToken,
						updatedAt: sql`NOW()`,
					},
				});

			return { token: accessToken };
		} catch (e) {
			throw e;
		}
	}

	/**
	 * Генерирует новый access-токен для юзера userId.
	 *
	 * @description Если соотв. ему refresh-токен валидный, то access будет на основе текущего refresh-токена
	 * Иначе - сгенерирует новую пару access & refresh
	 *
	 * @param userId
	 *
	 * @returns access-токен
	 *
	 * @throws UnauthorizedException если соотв. refresh-токен не найден в бд (юзер не прошел регистрацию)
	 * @throws Error при внутренней ошибке
	 */
	async generateAccessTokenByUserId(userId: string): Promise<Token.TokenResponse> {
		const [existingRefreshToken] = await this.db.db
			.select({ refreshToken: tokens.refreshToken })
			.from(tokens)
			.where(eq(tokens.userId, userId))
			.limit(1);

		if (!existingRefreshToken) {
			throw new UnauthorizedException('User not found');
		}

		try {
			const decodedRefreshToken = this.jwtService.verify(existingRefreshToken.refreshToken);

			const [payload]: Token.Payload[] = await this.db.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (!payload) {
				throw new UnauthorizedException('User not found');
			}

			const accessToken = this.jwtService.sign(
				{
					...payload,
					hs: this.hashSeed(Buffer.from(decodedRefreshToken.s, 'hex')),
				},
				{ expiresIn: this.envService.get('ACCESS_TOKEN_EXPIRATION_TIME') },
			);

			return { token: accessToken };
		} catch (e) {
			if (e.name === 'TokenExpiredError') {
				// если срок жизни текущего refresh-токена закончился - генерируем новую пару
				return this.generatePairAndGetAccess(userId);
			}

			throw e;
		}
	}

	/**
	 * Выдает новый access-токен на основе данных из переданного.
	 * При условии, что соотв. ему refresh-токен существует и валидный
	 *
	 * @param accessToken - access-токен, который необходимо обновить (продлить).
	 * @returns Возвращает новый access-токен.
	 *
	 * @throws UnauthorizedException если соотв. refresh-токен не валидный, или не составляет пару
	 */
	async refreshAccessToken(accessToken: string): Promise<Token.TokenResponse> {
		const decodedAccessToken: Token.Access = this.jwtService.decode(accessToken);

		if (!decodedAccessToken || !('hs' in decodedAccessToken)) {
			throw new BadRequestException('Bad token format');
		}

		const hashedSeedFromAccessToken = decodedAccessToken.hs; // хэш сида из публичного токена
		let hashedSeedFromRefreshToken = ''; // хэш сида из приватного токена (будет получен после запроса к БД)

		try {
			const [token] = await this.db.db
				.select({ refreshToken: tokens.refreshToken })
				.from(tokens)
				.where(eq(tokens.userId, decodedAccessToken.id))
				.limit(1);

			if (!token) {
				throw new UnauthorizedException('Token not found');
			}

			const decodedRefreshToken: Token.Refresh = this.jwtService.verify(token.refreshToken);
			hashedSeedFromRefreshToken = this.hashSeed(Buffer.from(decodedRefreshToken.s, 'hex'));
		} catch (e) {
			throw new UnauthorizedException();
		}

		// сравниваем хэши двух сидов (из публичного и приватного токенов)
		if (hashedSeedFromRefreshToken === hashedSeedFromAccessToken) {
			// хэши совпадают, значит токены составляют пару
			// т.е. access токен соответствует текущему лайфтайму refresh токена
			const { ...decodedTokenData } = decodedAccessToken;
			return {
				token: this.jwtService.sign(decodedTokenData, {
					expiresIn: this.envService.get('ACCESS_TOKEN_EXPIRATION_TIME'),
				}),
			};
		}

		// иначе - хэши не совпадают, значит токены не имеют связи между собой
		// т.е. access был сгенерирован на одном из прошлых (expired) refresh токенов
		throw new UnauthorizedException();
	}
}
