import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { training, trainingParticipants } from 'src/modules/database/schema';
import { and, eq, isNotNull } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

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
