import React from 'react'
import { View, Text } from 'react-native'
import { Motion } from '@legendapp/motion'
import { Colors } from '@/constants/Colors'

interface DayGoal {
	day: string
	goal: number
}

interface WeeklyGoalsChartProps {
	data: DayGoal[]
}

const CHART_HEIGHT = 128

const WeeklyGoalsChart = ({ data }: WeeklyGoalsChartProps) => {
	const maxGoal = Math.max(...data.map((d) => d.goal), 1)

	return (
		<View
			style={{
				backgroundColor: Colors['gray-2c'],
				borderRadius: 16,
				padding: 16
			}}
		>
			<View className="flex-row justify-end" style={{ marginBottom: 8 }}>
				<Text className="text-xs text-gray-ab">{maxGoal}</Text>
			</View>

			<View className="flex-row items-end justify-between gap-2 mb-3" style={{ height: CHART_HEIGHT }}>
				{data.map((day) => {
					const barHeight = (day.goal / maxGoal) * CHART_HEIGHT

					return (
						<View key={day.day} className="flex-1 items-center justify-end h-full">
							<Motion.View
								animate={{ height: barHeight }}
								transition={{
									type: 'timing',
									duration: 300
								}}
								className="w-full rounded-t-lg"
								style={{
									backgroundColor: Colors['green-main'],
									borderTopStartRadius: 8,
									borderTopEndRadius: 8
								}}
							/>
						</View>
					)
				})}
			</View>

			<View className="flex-row justify-between px-0.5 gap-2">
				{data.map((day) => (
					<Text key={day.day} className="text-xs text-gray-ab flex-1 text-center">
						{day.day}
					</Text>
				))}
			</View>
		</View>
	)
}

export default WeeklyGoalsChart
