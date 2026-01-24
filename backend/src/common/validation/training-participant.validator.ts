import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { trainingParticipants } from 'src/modules/database/schema';
import { eq } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

@Injectable()
@ValidatorConstraint({ async: true })
export class TrainingParticipantValidator implements ValidatorConstraintInterface {
	constructor(private db: DatabaseService) {}

	async validate(trainingParticipantId: string): Promise<boolean> {
		const [participant] = await this.db.db
			.select({ id: trainingParticipants.id })
			.from(trainingParticipants)
			.where(eq(trainingParticipants.id, trainingParticipantId))
			.limit(1);
		return !!participant;
	}

	defaultMessage(args: ValidationArguments): string {
		return `_${args.property}:${ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT}`;
	}
}
