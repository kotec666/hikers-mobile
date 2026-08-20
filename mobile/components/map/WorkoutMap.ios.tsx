import React from 'react'
import RNMapWorkout from '@/components/map/RNMapWorkout'
import type { WorkoutMapProps } from './WorkoutMap.types'

const WorkoutMap = (props: WorkoutMapProps) => {
	const {
		rnMapComponentRef,
		rnMapUserLocationMarkerRef,

		appleLogoPosition,
		appleLegalPosition,

		...commonProps
	} = props

	return (
		<RNMapWorkout
			ref={rnMapComponentRef}
			userLocationMarkerRef={rnMapUserLocationMarkerRef}
			appleLogoPosition={appleLogoPosition}
			appleLegalPosition={appleLegalPosition}
			{...commonProps}
		/>
	)
}

export default WorkoutMap
