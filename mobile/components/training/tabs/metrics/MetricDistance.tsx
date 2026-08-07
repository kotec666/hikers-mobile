import React, { memo, forwardRef, useImperativeHandle, useState } from 'react'
import Parameter from '@/components/training/Parameter'
import { formatDistance } from '@/helpers/distance'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
}

export interface MetricDistanceHandle {
	setDistance: (meters: number) => void
}

const MetricDistance = forwardRef<MetricDistanceHandle, IProps>((props, ref) => {
	const { t, i18n } = useTranslation()
	const [distanceStr, setDistanceStr] = useState('0м')

	useImperativeHandle(ref, () => ({
		setDistance: (meters: number) => {
			setDistanceStr(
				formatDistance(meters, i18n.language, {
					meter: t('measurementUnits.meters.short'),
					kilometer: t('measurementUnits.km.short')
				})
			)
		}
	}))

	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.range')} value={distanceStr} />
})

MetricDistance.displayName = 'MetricDistance'
export default memo(MetricDistance)
