import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { training } from 'src/modules/database/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

@Injectable()
@ValidatorConstraint({ async: true })
export class FinishedTrainingValidator implements ValidatorConstraintInterface {
	constructor(private db: DatabaseService) {}

	async validate(trainingId: string): Promise<boolean> {
		const [row] = await this.db.db
			.select({ id: training.id })
			.from(training)
			.where(and(eq(training.id, trainingId), isNotNull(training.finishedAt)))
			.limit(1);
		return !!row;
	}

	defaultMessage(args: ValidationArguments): string {
		return `_${args.property}:${ERRORS.USER_IN_NOT_FINISHED_TRAINING}`;
	}
}
