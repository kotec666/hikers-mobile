import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { calculatePace } from '@/helpers/calculatePace'

interface IProps {
	isPaused: boolean
	workoutTimeMs: number
	totalDistanceMeters: number
}

const MetricAveragePace = memo((props: IProps) => {
	const averagePace = useMemo(
		() => calculatePace(props.workoutTimeMs, props.totalDistanceMeters),
		[props.workoutTimeMs, props.totalDistanceMeters]
	)

	console.log('render MetricAveragePace')
	return <Parameter isPaused={props.isPaused} label="Ср. темп" value={averagePace} />
})

MetricAveragePace.displayName = 'MetricAveragePace'

export default MetricAveragePace
