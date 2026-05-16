import React from 'react'
import {
	Circle,
	DashPathEffect,
	useFont,
	vec,
	Text as SKText,
	Line as SKLine,
	AnimatedProp,
	LinearGradient
} from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'
import { CartesianChart, ChartPressState, Line, useChartPressState, useChartTransformState, Area } from 'victory-native'
import { View, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { haversineDistance } from '@shared/helpers'
import { fontFamily } from '@/constants/Fonts'

const manrope = require('@/assets/fonts/Manrope-Regular-400.otf')

type PacePoint = {
	t: number // seconds from start
	pace: number // seconds per km
}

const formatPace = (sec: number) => {
	const m = Math.floor(sec / 60)
	const s = Math.floor(sec % 60)
	return `${m}'${String(s).padStart(2, '0')}"`
}

const formatTime = (sec: number) => {
	const hours = Math.floor(sec / 3600)
	const minutes = Math.floor((sec % 3600) / 60)
	const seconds = Math.floor(sec % 60)

	const hh = hours > 0 ? `${hours}:` : ''
	const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
	const ss = String(seconds).padStart(2, '0')

	return `${hh}${mm}:${ss}`
}

const buildPaceChartData = (points: IWorkoutLocationStorageItem[]): PacePoint[] => {
	if (!points || points.length < 2) return []

	const sorted = [...points].sort((a, b) => a.relTs - b.relTs)

	let activeTime = 0
	const result: PacePoint[] = []

	for (let i = 1; i < sorted.length; i++) {
		const prev = sorted[i - 1]
		const cur = sorted[i]

		const dt = (cur.relTs - prev.relTs) / 1000
		if (dt <= 0) continue

		// Интервал относится к состоянию предыдущей точки; маркер паузы завершает активный участок.
		if (!prev.paused) {
			activeTime += dt
		}

		if (cur.paused || prev.paused) continue

		const dist = haversineDistance(
			prev.locationObject.coords.latitude,
			prev.locationObject.coords.longitude,
			cur.locationObject.coords.latitude,
			cur.locationObject.coords.longitude
		)

		if (dist < 1) continue

		const pace = dt / (dist / 1000) // sec/km

		if (!Number.isFinite(pace)) continue

		result.push({
			t: activeTime,
			pace
		})
	}

	return result
}

export const LineChart = (props: { points: IWorkoutLocationStorageItem[] | null }) => {
	const font = useFont(manrope, 12)
	const { state, isActive } = useChartPressState({ x: 0, y: { pace: 0 } })
	const { state: transformState } = useChartTransformState()

	const chartData = React.useMemo(() => {
		if (!props.points) return []
		return buildPaceChartData(props.points)
	}, [props.points])

	return (
		<View className="w-full items-center flex-1">
			<View style={{ width: '100%', height: '100%' }}>
				{chartData.length === 0 ? (
					<View className="flex-1 items-center justify-center">
						<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base text-center">
							Недостаточно данных для отображения графика
						</Text>
					</View>
				) : (
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

									<Area
										points={points.pace}
										y0={chartBounds.bottom}
										curveType="natural"
										animate={{ type: 'timing', duration: 500 }}
									>
										<LinearGradient
											start={vec(0, chartBounds.top)}
											end={vec(0, chartBounds.bottom)}
											colors={[
												'rgba(144, 238, 144, 0.45)', // сверху (под линией)
												'rgba(144, 238, 144, 0.05)' // вниз — почти прозрачный
											]}
										/>
									</Area>

									<Line
										points={points.pace}
										color="lightgreen"
										strokeWidth={3}
										animate={{ type: 'timing', duration: 500 }}
										curveType="natural"
										connectMissingData
									/>

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
				)}
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
