import { View } from 'react-native'
import { cn } from '@/helpers/cn'
import React, { memo } from 'react'
import MetricTime from '@/components/training/tabs/metrics/MetricTime'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import MetricSpeed, { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import MetricDistance, { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import MetricAveragePace from '@/components/training/tabs/metrics/MetricAveragePace'
import MetricCalories, { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import MetricHeight, { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import { TrainingType } from '@shared/enums'
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer'

interface IProps {
	workoutType: TrainingType
	mapViewHidden: boolean
	isPaused: boolean
	metricSpeedRef: React.RefObject<MetricSpeedHandle | null>
	metricDistanceRef: React.RefObject<MetricDistanceHandle | null>
	metricCaloriesRef: React.RefObject<MetricCaloriesHandle | null>
	metricHeightRef: React.RefObject<MetricHeightHandle | null>
	accumulatedDistanceRef: React.RefObject<number>
}

const MetricsTab = memo((props: IProps) => {
	const workoutTime = useWorkoutTimer(props.isPaused)

	console.log('render MetricsTab=====>')
	return (
		<View className="gap-4">
			{props.mapViewHidden && (
				<MetricTime isPaused={props.isPaused} workoutTimeFormatted={workoutTime.formatted} />
			)}
			<View
				className={cn('', {
					'flex-row justify-between': props.mapViewHidden,
					'gap-4': !props.mapViewHidden
				})}
			>
				{!props.mapViewHidden && (
					<MetricTime isPaused={props.isPaused} workoutTimeFormatted={workoutTime.formatted} />
				)}
				<MetricSpeed ref={props.metricSpeedRef} isPaused={props.isPaused} />
				<MetricDistance ref={props.metricDistanceRef} isPaused={props.isPaused} />
				<MetricAveragePace
					isPaused={props.isPaused}
					accumulatedDistanceRef={props.accumulatedDistanceRef}
					workoutTimeMs={workoutTime.ms}
				/>
				{!props.mapViewHidden && <MetricCalories ref={props.metricCaloriesRef} isPaused={props.isPaused} />}

				{!props.mapViewHidden && <MetricHeight ref={props.metricHeightRef} isPaused={props.isPaused} />}
			</View>
		</View>
	)
})

MetricsTab.displayName = 'MetricsTab'

export default MetricsTab
