import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { getWorkoutHeight } from '@/helpers/getWorkoutHeight'

interface IProps {
	isPaused: boolean
	userLocations: React.RefObject<IWorkoutLocationStorageItem[]>
}

const MetricHeight = memo(
	(props: IProps) => {
		const calculatedHeight = useMemo(
			() => getWorkoutHeight(props.userLocations.current),
			[props.userLocations.current.length]
		)

		console.log('render MetricHeight')
		return (
			<Parameter
				isPaused={props.isPaused}
				label="Набор высоты"
				value={calculatedHeight == null ? '- м' : `${calculatedHeight} м`}
			/>
		)
	},
	(prevProps, nextProps) =>
		prevProps.isPaused === nextProps.isPaused &&
		prevProps.userLocations.current.length === nextProps.userLocations.current.length
)

MetricHeight.displayName = 'MetricHeight'

export default MetricHeight
