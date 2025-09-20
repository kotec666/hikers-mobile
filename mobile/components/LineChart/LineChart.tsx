import React from 'react'
import { DataSet, LineChart, lineDataItem } from 'react-native-gifted-charts'
import { Colors } from '@/constants/Colors'
import { Dimensions, View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const { width } = Dimensions.get('screen')

const LineChartComponent = () => {
	const elevationData: lineDataItem[] = [
		{ value: 50, label: '10:29' },
		{ value: 120, label: '10:39' },
		{ value: 80, label: '10:49' },
		{ value: 160, label: '10:59' },
		{ value: 90, label: '11:09' },
		{ value: 200, label: '11:19' },
		{ value: 210, label: '12:19' },
		{ value: 220, label: '13:19' },
		{ value: 260, label: '14:19' },
		{ value: 290, label: '15:19' }
	]

	const paceData: lineDataItem[] = [
		{ value: 60, label: '10:39' },
		{ value: 140, label: '10:39' },
		{ value: 100, label: '10:49' },
		{ value: 150, label: '10:59' },
		{ value: 120, label: '11:09' },
		{ value: 200, label: '11:19' },
		{ value: 250, label: '12:19' },
		{ value: 260, label: '13:19' },
		{ value: 265, label: '14:19' },
		{ value: 295, label: '15:19' }
	]

	const datasetsWithPress: DataSet[] = [
		{
			data: paceData,
			color: '#CCFF33',
			thickness: 3,
			dataPointsColor: '#CCFF33',
			startFillColor: 'rgba(204,255,51,0.3)',
			endFillColor: 'rgba(204,255,51,0.0)',
			startOpacity: 0.4,
			endOpacity: 0.1,
			curved: false
		},
		{
			data: elevationData,
			color: '#FF6A33',
			thickness: 3,
			dataPointsColor: '#FF6A33',
			startFillColor: 'rgba(255,106,51,0.3)',
			endFillColor: 'rgba(255,106,51,0.0)',
			startOpacity: 0.4,
			endOpacity: 0.1,
			curved: false
		}
	]

	const pointerLabelWidth = 150
	return (
		<LineChart
			initialSpacing={10}
			endSpacing={30}
			isAnimated
			width={width - 120}
			animateOnDataChange
			animationDuration={1000}
			onDataChangeAnimationDuration={300}
			areaChart
			hideDataPoints={false}
			dataSet={datasetsWithPress}
			hideRules={false}
			yAxisTextStyle={{ color: 'white', fontSize: 12 }}
			xAxisLabelTextStyle={{ color: 'white', fontSize: 12 }}
			xAxisColor={Colors['black-44']}
			yAxisColor={Colors['black-44']}
			rulesColor={Colors['black-44']}
			showVerticalLines
			pointerConfig={{
				pointerStripUptoDataPoint: true,
				pointerColor: 'transparent',
				showPointerStrip: true,
				pointerLabelWidth: pointerLabelWidth,
				pointerLabelComponent: (items: lineDataItem[]) => {
					if (!items?.length) return null

					return (
						<View
							className="min-w-[120px] bg-black-25 border-[1px] border-white/20 rounded-[5px] items-start justify-center self-center"
							style={{
								minWidth: pointerLabelWidth,
								padding: 10
							}}
						>
							{items.map((item, index) => {
								const dotColor = index === 0 ? '#CCFF33' : '#FF6A33'

								return (
									<View key={index} className="flex-row items-center gap-[7px]">
										<View
											className="w-[10px] h-[10px] rounded-full"
											style={{
												backgroundColor: dotColor
											}}
										/>
										<Text
											className="text-sm text-white"
											style={{
												fontFamily: fontFamily.bold,
												flexShrink: 1
											}}
										>
											{index === 0 ? 'Вы' : 'Steve'}: {item.label}, {item.value}
										</Text>
									</View>
								)
							})}
						</View>
					)
				},
				activatePointersOnLongPress: true,
				autoAdjustPointerLabelPosition: true
			}}
		/>
	)
}

export default LineChartComponent
