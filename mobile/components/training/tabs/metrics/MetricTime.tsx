import React, { memo } from 'react'
import Parameter from '@/components/training/Parameter'

interface IProps {
	isPaused: boolean
	workoutTimeFormatted: string
}

const MetricTime = memo((props: IProps) => {
	console.log('render MetricTime')
	return <Parameter isPaused={props.isPaused} label="Время" value={props.workoutTimeFormatted} />
})

MetricTime.displayName = 'MetricTime'

export default MetricTime
