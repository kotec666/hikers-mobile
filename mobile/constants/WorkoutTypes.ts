import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import { TrainingType } from '@shared/enums'

export const WorkoutTypesData = [
	{ id: 1, type: TrainingType.WALK, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 2, type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед last', IconComponent: WorkoutBicycle }
]
