import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { calculateCalories } from '@/helpers/calculateCalories'
import { TrainingType } from '@shared/enums'

interface IProps {
	workoutType: TrainingType
	workoutTimeMs: number
	totalDistanceMeters: number
	isPaused: boolean
}

const MetricCalories = memo((props: IProps) => {
	const calories = useMemo(
		() => calculateCalories(props.workoutTimeMs, props.totalDistanceMeters, props.workoutType, 70), // @TODO вес пользователя
		[props.workoutTimeMs, props.totalDistanceMeters, props.workoutType]
	)

	console.log('render MetricCalories')
	return <Parameter isPaused={props.isPaused} label="Ккал" value={calories} />
})

MetricCalories.displayName = 'MetricCalories'

export default MetricCalories
