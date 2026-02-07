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
import { CartesianChart, ChartPressState, Line, useChartPressState, useChartTransformState } from 'victory-native'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'

const manrope = require('@/assets/fonts/Manrope-Regular-400.otf')

type PacePoint = {
	t: number // seconds from start
	pace: number // seconds per km
}

// 0 → 25 минут, точка каждые 5 сек
const DATA: PacePoint[] = Array.from({ length: 50 }, (_, i) => {
	const t = i * 5

	// базовый темп ~6:00/км с небольшими колебаниями
	const basePace = 360
	const variation = Math.sin(i / 15) * 25 + Math.random() * 10

	return {
		t,
		pace: basePace + variation
	}
})

const formatPace = (sec: number) => {
	const m = Math.floor(sec / 60)
	const s = Math.floor(sec % 60)
	return `${m}'${String(s).padStart(2, '0')}"`
}

const formatTime = (sec: number) => {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const LineChart = () => {
	const font = useFont(manrope, 12)
	const { state, isActive } = useChartPressState({ x: 0, y: { pace: 0 } })
	const { state: transformState } = useChartTransformState()
	const [chartData, setChartData] = useState(DATA)

	return (
		<View className="w-full items-center flex-1">
			<View style={{ width: '100%', height: '100%' }}>
				<CartesianChart
					data={chartData}
					xKey="t"
					yKeys={['pace']}
					yAxis={[
						{
							font,
							enableRescaling: true,
							labelColor: 'white',
							lineColor: 'white',
							formatYLabel: (v) => formatPace(v),
							linePathEffect: <DashPathEffect intervals={[4, 4]} />
						}
					]}
					xAxis={{
						font,
						enableRescaling: true,
						labelColor: 'white',
						lineColor: 'white',
						formatXLabel: (v) => formatTime(v),
						linePathEffect: <DashPathEffect intervals={[4, 4]} />
					}}
					domainPadding={{ top: 30 }}
					transformConfig={{
						pan: {
							enabled: true,
							dimensions: ['x']
						}
					}}
					// viewport={{
					// 	x: [15, 30],
					// 	y: [40, 85]
					// }}
					// viewport={{
					// 	x: [0, 1200], // 0–20 мин
					// 	y: [300, 480] // 5:00–8:00 /км
					// }}
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
												yPosition={state.y.pace.position}
												bottom={chartBounds.bottom}
												top={chartBounds.top}
												activeValue={state.y.pace.value}
												textColor={'#FFF'}
												lineColor={'#71717a'}
												indicatorColor={Colors['white']}
												state={state}
											/>
										</>
									)}
								</>

								<Line
									points={points.pace}
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

								{points.pace.map((point, index) => (
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
	topOffset = 0,
	state
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
	state: ChartPressState<{
		x: number
		y: {
			pace: number
		}
	}>
}) => {
	const FONT_SIZE = 16
	const font = useFont(manrope, FONT_SIZE)
	const start = useDerivedValue(() => vec(xPosition.value, bottom))
	const end = useDerivedValue(() => vec(xPosition.value, top + 1.5 * FONT_SIZE + topOffset))

	// Text label
	const activeValueDisplay = useDerivedValue(() => {
		const pace = activeValue.value
		if (!Number.isFinite(pace)) return ''

		// --- pace (sec/km) ---
		const paceMin = Math.floor(pace / 60)
		const paceSec = Math.floor(pace % 60)
		const paceSecStr = paceSec < 10 ? `0${paceSec}` : `${paceSec}`

		// --- time (sec from start) ---
		const rawTime = state.x.value.value
		if (rawTime == null) return `${paceMin}'${paceSecStr}"`

		const totalSec = Number(rawTime)
		if (!Number.isFinite(totalSec)) return `${paceMin}'${paceSecStr}"`

		const hours = Math.floor(totalSec / 3600)
		const minutes = Math.floor((totalSec % 3600) / 60)
		const seconds = Math.floor(totalSec % 60)

		const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`
		const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`

		const timeStr = hours > 0 ? `${hours}:${minStr}:${secStr}` : `${minutes}:${secStr}`

		return `${paceMin}'${paceSecStr}"  ${timeStr}`
	})
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
