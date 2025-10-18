import { TrainingType } from '@shared/enums';

export namespace TrainingDto {
	// @TODO
	// export type Entity ={
	// }
}

export namespace TrainingTypeDto {
	export type Entity = {
		name: TrainingType;
		measuringUnit: string; // @TODO enum?
		iconFilename: string | null;
	};
}
