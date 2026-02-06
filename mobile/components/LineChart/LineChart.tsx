import React, { useState } from 'react'
import {
	Circle,
	DashPathEffect,
	useFont,
	vec,
	Text as SKText,
	Line as SKLine,
	AnimatedProp
} from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'
import { CartesianChart, Line, useChartPressState, useChartTransformState } from 'victory-native'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'
import { DATA } from './utils/data'

const manrope = require('@/assets/fonts/Manrope-Regular-400.otf')

export const LineChart = () => {
	const font = useFont(manrope, 12)
	const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } })
	const { state: transformState } = useChartTransformState()
	const [chartData, setChartData] = useState(DATA)

	return (
		<View className="w-full items-center flex-1">
			<View style={{ width: '100%', height: '100%' }}>
				<CartesianChart
					data={chartData}
					xKey="day"
					yKeys={['highTmp']}
					yAxis={[
						{
							font,
							enableRescaling: true,
							labelColor: 'white',
							lineColor: 'white',
							linePathEffect: <DashPathEffect intervals={[4, 4]} />
						}
					]}
					xAxis={{
						font,
						enableRescaling: true,
						labelColor: 'white',
						lineColor: 'white',
						linePathEffect: <DashPathEffect intervals={[4, 4]} />
					}}
					domainPadding={{ top: 30 }}
					transformConfig={{
						pan: {
							enabled: true,
							dimensions: ['x']
						}
					}}
					viewport={{
						x: [15, 30],
						y: [40, 85]
					}}
					chartPressState={state}
					transformState={transformState}
				>
					{({ points, chartBounds }) => {
						return (
							<>
								<>
									{isActive && (
										<>
											<ActiveValueIndicator
												xPosition={state.x.position}
												yPosition={state.y.highTmp.position}
												bottom={chartBounds.bottom}
												top={chartBounds.top}
												activeValue={state.y.highTmp.value}
												textColor={'#FFF'}
												lineColor={'#71717a'}
												indicatorColor={Colors['white']}
											/>
										</>
									)}
								</>

								<Line
									points={points.highTmp}
									color="lightgreen"
									strokeWidth={3}
									animate={{ type: 'timing', duration: 500 }}
									curveType="natural"
									connectMissingData
								/>

								{/*<Area*/}
								{/*	points={points.highTmp}*/}
								{/*	y0={chartBounds.bottom}*/}
								{/*	animate={{ type: 'timing', duration: 500 }}*/}
								{/*>*/}
								{/*	<LinearGradient*/}
								{/*		start={vec(chartBounds.bottom, 200)}*/}
								{/*		end={vec(chartBounds.bottom, chartBounds.bottom)}*/}
								{/*		colors={['green', '#90ee9050']}*/}
								{/*	/>*/}
								{/*</Area>*/}

								{points.highTmp.map((point, index) => (
									<Circle
										key={index}
										cx={point.x}
										cy={point.y as AnimatedProp<number>}
										r={4}
										color={Colors['green-20d']}
									/>
								))}
							</>
						)
					}}
				</CartesianChart>
			</View>
		</View>
	)
}

const ActiveValueIndicator = ({
	xPosition,
	yPosition,
	top,
	bottom,
	activeValue,
	textColor,
	lineColor,
	indicatorColor,
	topOffset = 0
}: {
	xPosition: SharedValue<number>
	yPosition: SharedValue<number>
	activeValue: SharedValue<number>
	bottom: number
	top: number
	textColor: string
	lineColor: string
	indicatorColor: string
	topOffset?: number
}) => {
	const FONT_SIZE = 16
	const font = useFont(manrope, FONT_SIZE)
	const start = useDerivedValue(() => vec(xPosition.value, bottom))
	const end = useDerivedValue(() => vec(xPosition.value, top + 1.5 * FONT_SIZE + topOffset))
	// Text label
	const activeValueDisplay = useDerivedValue(() => '$' + activeValue.value.toFixed(2))
	const activeValueWidth = useDerivedValue(
		() =>
			font?.getGlyphWidths?.(font.getGlyphIDs(activeValueDisplay.value)).reduce((sum, value) => sum + value, 0) ||
			0
	)
	const activeValueX = useDerivedValue(() => xPosition.value - activeValueWidth.value / 2)

	return (
		<>
			<SKLine p1={start} p2={end} color={lineColor} strokeWidth={1} />
			<Circle cx={xPosition} cy={yPosition} r={8} color={indicatorColor} opacity={0.5} />
			<Circle cx={xPosition} cy={yPosition} r={8} color="hsla(0, 0, 100%, 0.25)" />
			<SKText
				color={textColor}
				font={font}
				text={activeValueDisplay}
				x={activeValueX}
				y={top + FONT_SIZE + topOffset}
			/>
		</>
	)
}
