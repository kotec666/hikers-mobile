import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import { TrainingType } from '@shared/enums'

export const WorkoutTypesData = [
	{ type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ type: TrainingType.WALK, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle }
]

export const WorkoutTypesMap = Object.fromEntries(WorkoutTypesData.map((w) => [w.type, w]))
