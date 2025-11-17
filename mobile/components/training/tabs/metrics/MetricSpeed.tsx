import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { mpsToKmph } from '@/helpers/mpsToKmph'

interface IProps {
	isPaused: boolean
	speedMPS: number
}

const MetricSpeed = memo((props: IProps) => {
	const kmph = useMemo(() => mpsToKmph(props.speedMPS) + ' км/ч', [props.speedMPS])

	console.log('render MetricSpeed')
	return <Parameter isPaused={props.isPaused} label="Скорость" value={kmph} />
})

MetricSpeed.displayName = 'MetricSpeed'

export default MetricSpeed
