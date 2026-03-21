import { TrainingType } from '@shared/enums'
import { BicyclePersonSvg, RunningPersonSvg, WalkingPersonSvg } from '@/app/components/svg'

export const WorkoutTypesData = [
	{ id: 1, type: TrainingType.WALK, name: 'Ходьба', IconComponent: WalkingPersonSvg },
	{ id: 2, type: TrainingType.RUN, name: 'Забег', IconComponent: RunningPersonSvg },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: BicyclePersonSvg }
]

export const WorkoutTypesMap = Object.fromEntries(WorkoutTypesData.map((w) => [w.type, w]))
