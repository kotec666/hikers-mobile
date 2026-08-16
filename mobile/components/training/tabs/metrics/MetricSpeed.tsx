import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { mpsToKmph } from '@/helpers/mpsToKmph'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
}

export interface MetricSpeedHandle {
	setSpeed: (speed: number) => void
}

const MetricSpeed = forwardRef<MetricSpeedHandle, IProps>((props, ref) => {
	const { t } = useTranslation()
	const kmh = t('measurementUnits.kmh') // км/ч
	const [speedKmh, setSpeedKmh] = useState(`0${kmh}`)

	useImperativeHandle(ref, () => ({
		setSpeed: (speed: number) => {
			const resultString = mpsToKmph(speed) + kmh
			if (resultString === speedKmh) return
			setSpeedKmh(resultString)
		}
	}))

	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.speed')} value={speedKmh} />
})

MetricSpeed.displayName = 'MetricSpeed'

export default React.memo(MetricSpeed)
