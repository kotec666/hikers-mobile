import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'

interface IProps {
	isPaused: boolean
}

export interface MetricAvgSpeedHandle {
	setAvgSpeed: (avgSpeed: number) => void
}

const MetricAvgSpeed = forwardRef<MetricAvgSpeedHandle, IProps>((props, ref) => {
	const [avgSpeedKmh, setAvgSpeedKmh] = useState('0км/ч')

	useImperativeHandle(ref, () => ({
		setAvgSpeed: (avgSpeed: number) => {
			const resultString = Math.round(avgSpeed) + 'км/ч'
			if (resultString === avgSpeedKmh) return
			setAvgSpeedKmh(resultString)
		}
	}))

	return <Parameter isPaused={props.isPaused} label="Ср. скорость" value={avgSpeedKmh} />
})

MetricAvgSpeed.displayName = 'MetricAvgSpeed'

export default React.memo(MetricAvgSpeed)
