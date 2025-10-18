import { TrainingTypeDto } from '../trainings/trainings.dto';

export namespace ActivitiyDto {
	export type Entity = {
		trainingType: TrainingTypeDto.Entity;
		place: number | null;
		goal: number;
	};
}
