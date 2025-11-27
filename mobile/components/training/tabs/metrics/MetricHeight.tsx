import React, { forwardRef, memo, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { getWorkoutHeight } from '@/helpers/getWorkoutHeight'

interface IProps {
	isPaused: boolean
}

export interface MetricHeightHandle {
	updateHeight: (points: IWorkoutLocationStorageItem[]) => void
}

const MetricHeight = forwardRef<MetricHeightHandle, IProps>((props, ref) => {
	const [height, setHeight] = useState<number | null>(0)

	useImperativeHandle(ref, () => ({
		updateHeight: (points) => {
			setHeight(getWorkoutHeight(points))
		}
	}))

	console.log('render MetricHeight')
	return <Parameter isPaused={props.isPaused} label="Набор высоты" value={height == null ? '- м' : `${height} м`} />
})

MetricHeight.displayName = 'MetricHeight'
export default memo(MetricHeight)
