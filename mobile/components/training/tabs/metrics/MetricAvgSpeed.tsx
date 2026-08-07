import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
}

export interface MetricAvgSpeedHandle {
	setAvgSpeed: (avgSpeed: number) => void
}

const MetricAvgSpeed = forwardRef<MetricAvgSpeedHandle, IProps>((props, ref) => {
	const { t } = useTranslation()
	const kmh = t('measurementUnits.kmh') // км/ч
	const [avgSpeedKmh, setAvgSpeedKmh] = useState(`0${kmh}`)

	useImperativeHandle(ref, () => ({
		setAvgSpeed: (avgSpeed: number) => {
			const resultString = Math.round(avgSpeed) + kmh
			if (resultString === avgSpeedKmh) return
			setAvgSpeedKmh(resultString)
		}
	}))

	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.avgSpeed')} value={avgSpeedKmh} />
})

MetricAvgSpeed.displayName = 'MetricAvgSpeed'

export default React.memo(MetricAvgSpeed)
