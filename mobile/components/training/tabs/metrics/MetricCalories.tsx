import React, { forwardRef, memo, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { calculateCalories } from '@/helpers/calculateCalories'
import { TrainingType } from '@shared/enums'

interface IProps {
	isPaused: boolean
}

export interface MetricCaloriesHandle {
	setCalories: (accumulatedDistance: number, timeElapsed: number, workoutType: TrainingType) => void
}

const MetricCalories = forwardRef<MetricCaloriesHandle, IProps>((props, ref) => {
	const [calories, setCalories] = useState(0)

	useImperativeHandle(ref, () => ({
		setCalories: (accumulatedDistance, timeElapsed, workoutType) => {
			setCalories(calculateCalories(accumulatedDistance, timeElapsed, workoutType, 70)) // @TODO вес пользователя)
		}
	}))

	console.log('render MetricCalories')
	return <Parameter isPaused={props.isPaused} label="Ккал" value={calories} />
})

MetricCalories.displayName = 'MetricCalories'

export default memo(MetricCalories)
