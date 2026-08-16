import { memo } from 'react'
import Parameter from '@/components/training/Parameter'
import { useTranslation } from 'react-i18next'

interface IProps {
	isPaused: boolean
	workoutTimeFormatted: string
}

const MetricTime = memo((props: IProps) => {
	const { t } = useTranslation()
	return <Parameter isPaused={props.isPaused} label={t('measurementUnits.time')} value={props.workoutTimeFormatted} />
})

MetricTime.displayName = 'MetricTime'

export default MetricTime
