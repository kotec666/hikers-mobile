import { View } from 'react-native'
import { cn } from '@/helpers/cn'
import React, { memo, useMemo } from 'react'
import MetricTime from '@/components/training/tabs/metrics/MetricTime'
import MetricSpeed from '@/components/training/tabs/metrics/MetricSpeed'
import MetricDistance from '@/components/training/tabs/metrics/MetricDistance'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import MetricAveragePace from '@/components/training/tabs/metrics/MetricAveragePace'
import MetricCalories from '@/components/training/tabs/metrics/MetricCalories'
import { TrainingType } from '@shared/enums'
import MetricHeight from '@/components/training/tabs/metrics/MetricHeight'
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer'
import { calculateTotalDistance } from '@/helpers/distance'

interface IProps {
	workoutType: TrainingType
	mapViewHidden: boolean
	isPaused: boolean
	speedMPS: number
	userLocations: IWorkoutLocationStorageItem[]
}

const MetricsTab = memo((props: IProps) => {
	const workoutTime = useWorkoutTimer()
	const totalDistanceMeters = useMemo(() => calculateTotalDistance(props.userLocations), [props.userLocations])

	console.log('renderMetricsTab ===============>')
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
				<MetricSpeed isPaused={props.isPaused} speedMPS={props.speedMPS} />
				<MetricDistance isPaused={props.isPaused} totalDistanceMeters={totalDistanceMeters} />
				<MetricAveragePace
					isPaused={props.isPaused}
					workoutTimeMs={workoutTime.ms}
					totalDistanceMeters={totalDistanceMeters}
				/>
				{!props.mapViewHidden && (
					<MetricCalories
						isPaused={props.isPaused}
						workoutType={props.workoutType}
						workoutTimeMs={workoutTime.ms}
						totalDistanceMeters={totalDistanceMeters}
					/>
				)}

				{!props.mapViewHidden && <MetricHeight isPaused={props.isPaused} userLocations={props.userLocations} />}
			</View>
		</View>
	)
})

MetricsTab.displayName = 'MetricsTab'

export default MetricsTab
