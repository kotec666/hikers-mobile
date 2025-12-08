import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { mpsToKmph } from '@/helpers/mpsToKmph'

interface IProps {
	isPaused: boolean
}

export interface MetricSpeedHandle {
	setSpeed: (speed: number) => void
}

const MetricSpeed = forwardRef<MetricSpeedHandle, IProps>((props, ref) => {
	const [speedKmh, setSpeedKmh] = useState('0 км/ч')

	useImperativeHandle(ref, () => ({
		setSpeed: (speed: number) => {
			const resultString = mpsToKmph(speed) + 'км/ч'
			if (resultString === speedKmh) return
			setSpeedKmh(resultString)
		}
	}))

	return <Parameter isPaused={props.isPaused} label="Скорость" value={speedKmh} />
})

MetricSpeed.displayName = 'MetricSpeed'

export default React.memo(MetricSpeed)
