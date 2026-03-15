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

// const formatTime = (sec: number) => {
// 	const m = Math.floor(sec / 60)
// 	const s = sec % 60
// 	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
// }

// С часами
const formatTime = (sec: number) => {
	const hours = Math.floor(sec / 3600)
	const minutes = Math.floor((sec % 3600) / 60)
	const seconds = Math.floor(sec % 60)

	const hh = hours > 0 ? `${hours}:` : ''
	const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
	const ss = String(seconds).padStart(2, '0')

	return `${hh}${mm}:${ss}`
}

// Длительность	Шаг	Точек
// 10 мин	5 сек	~120
// 30 мин	15 сек	~120
// 1 час	30 сек	~120
// 2 часа	60 сек	~120
// 5 часов	5 мин	~60
const getStepSeconds = (totalSeconds: number) => {
	const TARGET_POINTS = 120

	const raw = Math.ceil(totalSeconds / TARGET_POINTS)

	if (raw <= 5) return 5
	if (raw <= 10) return 10
	if (raw <= 15) return 15
	if (raw <= 30) return 30
	if (raw <= 60) return 60
	if (raw <= 120) return 120
	return 300 // 5 мин
}

// const buildPaceChartData = (points: IWorkoutLocationStorageItem[]): PacePoint[] => {
// 	if (points.length < 2) return []
//
// 	const totalSeconds = (points.at(-1)!.relTs - points[0].relTs) / 1000
//
// 	const stepSeconds = getStepSeconds(totalSeconds)
//
// 	let accDistance = 0
// 	let accTime = 0
// 	let lastTs = points[0].relTs
// 	let prev = points[0]
//
// 	const result: PacePoint[] = []
//
// 	for (let i = 1; i < points.length; i++) {
// 		const curr = points[i]
// 		if (curr.paused) continue
//
// 		const dt = (curr.relTs - lastTs) / 1000
// 		if (dt <= 0) continue
//
// 		const d = haversineDistance(
// 			prev.locationObject.coords.latitude,
// 			prev.locationObject.coords.longitude,
// 			curr.locationObject.coords.latitude,
// 			curr.locationObject.coords.longitude
// 		)
//
// 		accTime += dt
// 		accDistance += d
//
// 		if (accTime >= stepSeconds && accDistance > 10) {
// 			const pace = accTime / (accDistance / 1000)
//
// 			// фильтр мусора
// 			if (pace > 150 && pace < 900) {
// 				result.push({
// 					t: curr.relTs / 1000,
// 					pace
// 				})
// 			}
//
// 			accTime = 0
// 			accDistance = 0
// 		}
//
// 		prev = curr
// 		lastTs = curr.relTs
// 	}
//
// 	return result
// }

const buildPaceChartData = (points: IWorkoutLocationStorageItem[]): PacePoint[] => {
	if (points.length < 2) return []

	// Рассчитываем moving time для stepSeconds
	let movingTotal = 0
	for (let i = 1; i < points.length; i++) {
		if (points[i].paused) continue
		const dt = (points[i].relTs - points[i - 1].relTs) / 1000
		if (dt > 0) movingTotal += dt
	}
	const stepSeconds = getStepSeconds(movingTotal)

	let movingTime = 0
	let accDistance = 0
	let accTime = 0
	let lastTs = points[0].relTs
	let prev = points[0]

	const result: PacePoint[] = []

	for (let i = 1; i < points.length; i++) {
		const curr = points[i]

		if (curr.paused) {
			lastTs = curr.relTs
			prev = curr
			continue
		}

		let dt = (curr.relTs - lastTs) / 1000
		if (dt <= 0 || dt > 10) {
			// фильтр нереального dt
			lastTs = curr.relTs
			prev = curr
			continue
		}

		movingTime += dt

		const d = haversineDistance(
			prev.locationObject.coords.latitude,
			prev.locationObject.coords.longitude,
			curr.locationObject.coords.latitude,
			curr.locationObject.coords.longitude
		)

		accTime += dt
		accDistance += d

		if (accTime >= stepSeconds && accDistance > 10) {
			const pace = accTime / (accDistance / 1000)
			if (pace > 150 && pace < 900) {
				result.push({
					t: movingTime,
					pace
				})
			}
			accTime = 0
			accDistance = 0
		}

		prev = curr
		lastTs = curr.relTs
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
