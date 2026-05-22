import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../modules/database/database.service';
import { training, trainingParticipants, users } from '../../modules/database/schema';
import { and, eq, isNotNull } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import * as dns from 'dns/promises';

@Injectable()
@ValidatorConstraint({ async: true })
export class FinishedTrainingParticipantValidator implements ValidatorConstraintInterface {
	constructor(private db: DatabaseService) {}

	async validate(trainingParticipantId: string): Promise<boolean> {
		const [participant] = await this.db.db
			.select({ id: trainingParticipants.id })
			.from(trainingParticipants)
			.where(and(eq(trainingParticipants.id, trainingParticipantId), isNotNull(training.finishedAt)))
			.leftJoin(training, eq(training.id, trainingParticipants.trainingId))
			.limit(1);
		return !!participant;
	}

	defaultMessage(args: ValidationArguments): string {
		return `_${args.property}:${ERRORS.USER_IN_NOT_FINISHED_TRAINING}`;
	}
}

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

@ValidatorConstraint({ async: true })
export class ValidEmailDomainValidator implements ValidatorConstraintInterface {
	constructor() {}

	async validate(email: string): Promise<boolean> {
		const domain = email.split('@')[1];

		// Создаём резолвер с явным DNS-сервером
		const resolver = new dns.Resolver();
		resolver.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

		try {
			const mxRecords = await resolver.resolveMx(domain);
			console.log(`MX records for ${domain}:`, mxRecords);
			return mxRecords && mxRecords.length > 0;
		} catch (error) {
			console.error(`DNS error for ${domain}:`, error);
			return false;
		}
	}

	defaultMessage(args: ValidationArguments): string {
		return `_${args.property}:${ERRORS.INVALID_EMAIL}`;
	}
}
