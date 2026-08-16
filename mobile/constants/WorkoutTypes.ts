import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import { TrainingType } from '@shared/enums'

export const WorkoutTypesData = [
	{ type: TrainingType.RUN, name: 'WorkoutTypes.run', IconComponent: WorkoutRunning },
	{ type: TrainingType.WALK, name: 'WorkoutTypes.walk', IconComponent: WorkoutWalking },
	{ type: TrainingType.TRACK, name: 'WorkoutTypes.track', IconComponent: WorkoutWalking },
	{ type: TrainingType.BICYCLE, name: 'WorkoutTypes.bicycle', IconComponent: WorkoutBicycle }
]

export const WorkoutTypesMap = Object.fromEntries(WorkoutTypesData.map((w) => [w.type, w]))
