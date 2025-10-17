import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserDto } from './user.dto';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, hashPassword } from './user.helpers';
import { ERRORS } from '@shared/errors';

@Injectable()
export class UserService {
	constructor(private readonly db: DatabaseService) {}

	public async createUser(dto: UserDto.Registration): Promise<UserDto.Entity> {
		const hashedPassword = await hashPassword(dto.password);

		const [user] = await this.db.db
			.insert(users)
			.values({
				email: dto.email,
				password: hashedPassword,
			})
			.returning({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				avatarFilename: users.avatarFilename,
			});
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async getUserByEmailAndPassword(dto: UserDto.Login): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				avatarFilename: users.avatarFilename,
				password: users.password,
			})
			.from(users)
			.where(eq(users.email, dto.email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const isPasswordCorrect = await comparePassword(dto.password, user.password);
		if (!isPasswordCorrect) {
			throw new BadRequestException(ERRORS.MISMATCH);
		}

		return {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email,
			avatarFilename: user.avatarFilename,
		};
	}

	public async getUserByEmail(email: string): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async getUser(id: string): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				email: users.email,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async checkEmailAvailable(email: string): Promise<void> {
		const [existingUser] = await this.db.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser) {
			throw new BadRequestException(ERRORS.ALREADY_EXISTS);
		}
	}
}
