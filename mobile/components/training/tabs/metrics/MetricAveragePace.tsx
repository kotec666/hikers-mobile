import React, { memo, useMemo } from 'react'
import Parameter from '@/components/training/Parameter'
import { calculatePace } from '@/helpers/calculatePace'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
	workoutTimeMs: number
	accumulatedDistanceRef: React.RefObject<number>
}

const MetricAveragePace = memo((props: IProps) => {
	const { t } = useTranslation()
	const currentDistance = props.accumulatedDistanceRef.current

	const averagePace = useMemo(
		() => calculatePace(props.workoutTimeMs, currentDistance),
		[props.workoutTimeMs, currentDistance]
	)

	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.avgPace')} value={averagePace} />
})

MetricAveragePace.displayName = 'MetricAveragePace'

export default memo(MetricAveragePace)
