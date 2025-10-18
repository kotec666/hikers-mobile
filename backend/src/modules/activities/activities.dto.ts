import { MeasuringUnit, UserActivity } from '@shared/enums';

export namespace ActivitiyDto {
	export type Entity = {
		name: UserActivity;
		measuringUnit: MeasuringUnit;
		place: number | null;
		goal: number;
	};
}
