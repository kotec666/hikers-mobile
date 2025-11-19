import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { formatDistance } from '@/helpers/distance'

interface IProps {
	isPaused: boolean
	totalDistanceMeters: number
	// totalDistanceMeters || props.userLocations
}

const MetricDistance = memo((props: IProps) => {
	const distance = useMemo(() => formatDistance(props.totalDistanceMeters), [props.totalDistanceMeters])

	console.log('render MetricDistance')
	return <Parameter isPaused={props.isPaused} label="Дистанция" value={distance} />
})

MetricDistance.displayName = 'MetricDistance'

export default React.memo(MetricDistance)
