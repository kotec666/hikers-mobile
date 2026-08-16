import React, { forwardRef, memo, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { getWorkoutHeight } from '@/helpers/getWorkoutHeight'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
}

export interface MetricHeightHandle {
	updateHeight: (points: IWorkoutLocationStorageItem[]) => void
}

const MetricHeight = forwardRef<MetricHeightHandle, IProps>((props, ref) => {
	const { t } = useTranslation()
	const [height, setHeight] = useState<number | null>(0)

	useImperativeHandle(ref, () => ({
		updateHeight: (points) => {
			setHeight(getWorkoutHeight(points))
		}
	}))

	return (
		<Parameter
			isPaused={props.isPaused}
			label={t('measurementUnits.climb')}
			value={
				height == null
					? `-${t('measurementUnits.meters.short')}`
					: `${height}${t('measurementUnits.meters.short')}`
			}
		/>
	)
})

MetricHeight.displayName = 'MetricHeight'
export default memo(MetricHeight)
