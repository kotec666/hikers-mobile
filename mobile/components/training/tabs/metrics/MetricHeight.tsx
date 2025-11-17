import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { getWorkoutHeight } from '@/helpers/getWorkoutHeight'

interface IProps {
	isPaused: boolean
	userLocations: IWorkoutLocationStorageItem[]
}

const MetricHeight = memo((props: IProps) => {
	const calculatedHeight = useMemo(() => getWorkoutHeight(props.userLocations), [props.userLocations])

	console.log('render MetricHeight')
	return (
		<Parameter
			isPaused={props.isPaused}
			label="Набор высоты"
			value={calculatedHeight == null ? '- м' : `${calculatedHeight} м`}
		/>
	)
})

MetricHeight.displayName = 'MetricHeight'

export default MetricHeight
