import React, { forwardRef, memo, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { calculateCalories } from '@/helpers/calculateCalories'
import { TrainingType } from '@shared/enums'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
}

export interface MetricCaloriesHandle {
	updateCalories: (accumulatedDistance: number, timeElapsed: number, workoutType: TrainingType) => void
}

const MetricCalories = forwardRef<MetricCaloriesHandle, IProps>((props, ref) => {
	const { t } = useTranslation()
	const [calories, setCalories] = useState(0)

	useImperativeHandle(ref, () => ({
		updateCalories: (accumulatedDistance, timeElapsed, workoutType) => {
			setCalories(calculateCalories(timeElapsed, accumulatedDistance, workoutType, 70)) // @TODO вес пользователя
		}
	}))

	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.kcal')} value={calories} />
})

MetricCalories.displayName = 'MetricCalories'

export default memo(MetricCalories)
