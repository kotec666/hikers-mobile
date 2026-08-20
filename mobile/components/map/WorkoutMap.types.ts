import type React from 'react'
import type { IRNMapWorkoutProps, RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import type { IYaMapWorkoutProps, YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import type { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import type { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'

export type WorkoutMapProps = IRNMapWorkoutProps &
	Partial<IYaMapWorkoutProps> & {
		yaMapComponentRef?: React.RefObject<YaMapWorkoutHandle | null>
		rnMapComponentRef?: React.RefObject<RNMapWorkoutHandle | null>
		rnMapUserLocationMarkerRef?: React.RefObject<RNMapsUserLocationMarkerHandle | null>
		yaMapUserLocationMarkerRef?: React.RefObject<YaMapUserLocationMarkerHandle | null>
	}
