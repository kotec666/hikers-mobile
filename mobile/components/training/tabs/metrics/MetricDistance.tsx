import React, { memo, forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { formatDistance } from '@/helpers/distance'

interface IProps {
	isPaused: boolean
}

export interface MetricDistanceHandle {
	setDistance: (meters: number) => void
}

const MetricDistance = forwardRef<MetricDistanceHandle, IProps>((props, ref) => {
	const [distanceStr, setDistanceStr] = useState('0 м')

	useImperativeHandle(ref, () => ({
		setDistance: (meters: number) => {
			setDistanceStr(formatDistance(meters))
		}
	}))

	return <Parameter isPaused={props.isPaused} label="Дистанция" value={distanceStr} />
})

MetricDistance.displayName = 'MetricDistance'
export default memo(MetricDistance)
