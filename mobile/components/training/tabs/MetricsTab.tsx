import { View } from 'react-native'
import { cn } from '@/helpers/cn'
import React, { memo } from 'react'
import MetricTime from '@/components/training/tabs/metrics/MetricTime'
import MetricSpeed, { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import MetricDistance, { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import MetricAveragePace from '@/components/training/tabs/metrics/MetricAveragePace'
import MetricCalories, { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import MetricHeight, { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import { TrainingType } from '@shared/enums'
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer'
import MetricAvgSpeed, { MetricAvgSpeedHandle } from '@/components/training/tabs/metrics/MetricAvgSpeed'

interface IProps {
	workoutType: TrainingType
	mapViewHidden: boolean
	isPaused: boolean
	metricAvgSpeedRef: React.RefObject<MetricAvgSpeedHandle | null>
	metricSpeedRef: React.RefObject<MetricSpeedHandle | null>
	metricDistanceRef: React.RefObject<MetricDistanceHandle | null>
	metricCaloriesRef: React.RefObject<MetricCaloriesHandle | null>
	metricHeightRef: React.RefObject<MetricHeightHandle | null>
	accumulatedDistanceRef: React.RefObject<number>
}

const MetricCell = ({
	children,
	mapViewHidden,
	align = 'start'
}: {
	children: React.ReactNode
	mapViewHidden: boolean
	align?: 'start' | 'center' | 'end'
}) => {
	const alignClass = align === 'center' ? 'items-center' : align === 'end' ? 'items-end' : 'items-start'
	return <View className={mapViewHidden ? `flex-1 ${alignClass}` : ''}>{children}</View>
}

const MetricsTab = memo((props: IProps) => {
	const workoutTime = useWorkoutTimer(props.isPaused)

	return (
		<View className="gap-4">
			{props.mapViewHidden && (
				<MetricTime isPaused={props.isPaused} workoutTimeFormatted={workoutTime.formatted} />
			)}
			<View
				className={cn('', {
					'flex-row ': props.mapViewHidden,
					'gap-4': !props.mapViewHidden
				})}
			>
				{!props.mapViewHidden && (
					<MetricTime isPaused={props.isPaused} workoutTimeFormatted={workoutTime.formatted} />
				)}
				<MetricCell mapViewHidden={props.mapViewHidden} align="start">
					<MetricAvgSpeed ref={props.metricAvgSpeedRef} isPaused={props.isPaused} />
				</MetricCell>
				<MetricCell mapViewHidden={props.mapViewHidden} align="center">
					<MetricDistance ref={props.metricDistanceRef} isPaused={props.isPaused} />
				</MetricCell>
				<MetricCell mapViewHidden={props.mapViewHidden} align="end">
					<MetricAveragePace
						isPaused={props.isPaused}
						accumulatedDistanceRef={props.accumulatedDistanceRef}
						workoutTimeMs={workoutTime.ms}
					/>
				</MetricCell>
				<View style={{ display: props.mapViewHidden ? 'none' : 'flex' }}>
					<MetricSpeed ref={props.metricSpeedRef} isPaused={props.isPaused} />
				</View>
				<View style={{ display: props.mapViewHidden ? 'none' : 'flex' }}>
					<MetricCalories ref={props.metricCaloriesRef} isPaused={props.isPaused} />
				</View>
				<View style={{ display: props.mapViewHidden ? 'none' : 'flex' }}>
					<MetricHeight ref={props.metricHeightRef} isPaused={props.isPaused} />
				</View>
			</View>
		</View>
	)
})

MetricsTab.displayName = 'MetricsTab'

export default MetricsTab
