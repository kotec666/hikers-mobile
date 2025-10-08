import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { users } from 'src/modules/database/schema';
import { eq } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueEmailValidator implements ValidatorConstraintInterface {
	constructor(private db: DatabaseService) {}

	async validate(email: string): Promise<boolean> {
		const [user] = await this.db.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
		return !user;
	}

	defaultMessage(args: ValidationArguments): string {
		return `_${args.property}:${ERRORS.ALREADY_EXISTS}`;
	}
}
