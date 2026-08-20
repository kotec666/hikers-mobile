import React from 'react'
import YaMapWorkout from '@/components/map/YaMapWorkout'
import type { WorkoutMapProps } from './WorkoutMap.types'

const WorkoutMap = (props: WorkoutMapProps) => {
	const {
		yaMapComponentRef,
		yaMapUserLocationMarkerRef,

		logoPosition,
		logoPadding,

		...commonProps
	} = props

	return (
		<YaMapWorkout
			ref={yaMapComponentRef}
			userLocationMarkerRef={yaMapUserLocationMarkerRef}
			logoPosition={logoPosition}
			logoPadding={logoPadding}
			{...commonProps}
		/>
	)
}

export default WorkoutMap
