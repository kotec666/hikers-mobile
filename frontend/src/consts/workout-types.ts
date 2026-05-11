import { TrainingType } from '@shared/enums'
import { BicyclePersonSvg, RunningPersonSvg, WalkingPersonSvg } from '@/components/svg'

export const WorkoutTypesData = [
	{ type: TrainingType.RUN, name: 'Забег', IconComponent: RunningPersonSvg },
	{ type: TrainingType.WALK, name: 'Ходьба', IconComponent: WalkingPersonSvg },
	{ type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: BicyclePersonSvg }
]

export const WorkoutTypesMap = Object.fromEntries(WorkoutTypesData.map((w) => [w.type, w]))
