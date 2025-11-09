import { Polyline, Yamap } from 'react-native-yamap-plus-lite'
import UserLocationMarker from '@/components/ui/UserLocationMarker'
import React, { JSX, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { IWorkoutLocationStorageItem, removeAllWorkoutStorage } from '@/store/workoutStorage'
import { Colors } from '@/constants/Colors'
import { Button } from '@/components/ui/Button'
import PauseLocationMarker from '@/components/ui/PauseLocationMarker'
import ResumeLocationMarker from '@/components/ui/ResumeLocationMarker'
import FinishLocationMarker from '@/components/ui/FinishLocationMarker'

// const testLocations = [
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.377398777940066,
// 				longitude: 49.44734799788105
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: false,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37815399436764,
// 				longitude: 49.44731581137271
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: false,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.3782243952166,
// 				longitude: 49.449622511137036
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.377379577347824,
// 				longitude: 49.449676155317604
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37699556368535,
// 				longitude: 49.448302864295115
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: false,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.376662749043575,
// 				longitude: 49.44670426771426
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: false,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37599711195731,
// 				longitude: 49.4443761102777
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37533786497362,
// 				longitude: 49.44261658115514
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37533786497362,
// 				longitude: 49.44561658115514
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	},
// 	{
// 		rel_ts: 1,
// 		locationObject: {
// 			coords: {
// 				latitude: 53.37133786497362,
// 				longitude: 49.44661658115514
// 			},
// 			timestamp: 1,
// 			mocked: false
// 		},
// 		isPausedPoint: true,
// 		isSavedToServer: false
// 	}
// ]

export interface ILatLng {
	lat: number
	lon: number
}

interface IProps {
	maxMapHeight?: number
	minMapHeight?: number
	rounded?: number
	accuracy?: number | null
	heading?: number
	markerPosition?: ILatLng | null
	mapCenter?: ILatLng
	userLocations?: IWorkoutLocationStorageItem[]
}

const DEFAULT_MAP_CENTER = { lat: 55.758745, lon: 37.619153 }

const MapComponent = (props: IProps) => {
	const isFirstRenderPosition = useRef(false)
	const oldMarkerPosition = useRef<ILatLng | null | undefined>(null)
	const oldHeading = useRef(props.heading)
	const [animatedHeading, setAnimatedHeading] = useState<number | undefined>(props.heading)
	const [isAnimating, setIsAnimating] = useState(false)
	const [isHeadingAnimating, setIsHeadingAnimating] = useState(false)
	const [animatedMarkerPosition, setAnimatedMarkerPosition] = useState<ILatLng | undefined | null>(
		props.markerPosition
	)

	const animateToPosition = (targetPosition: ILatLng, duration: number = 500) => {
		if (isAnimating) return
		if (!oldMarkerPosition.current) return

		setIsAnimating(true)
		const startPosition = oldMarkerPosition.current
		const startTime = Date.now()

		const animateFrame = () => {
			const currentTime = Date.now()
			const progress = Math.min((currentTime - startTime) / duration, 1)

			// Эффект easing для более плавной анимации
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)

			const newLat = startPosition.lat + (targetPosition.lat - startPosition.lat) * easeOutQuart
			const newLon = startPosition.lon + (targetPosition.lon - startPosition.lon) * easeOutQuart

			const newPosition = { lat: newLat, lon: newLon }

			// Обновляем обе позиции синхронно
			setAnimatedMarkerPosition?.(newPosition)
			oldMarkerPosition.current = newPosition

			if (progress < 1) {
				requestAnimationFrame(animateFrame)
			} else {
				setIsAnimating(false)
			}
		}

		requestAnimationFrame(animateFrame)
	}

	const animateHeading = (targetHeading: number, duration: number = 300) => {
		if (isHeadingAnimating) return
		if (typeof oldHeading.current !== 'number' || typeof targetHeading !== 'number') return

		setIsHeadingAnimating(true)
		const startHeading = oldHeading.current
		const startTime = Date.now()

		// Нормализуем углы для корректного расчета кратчайшего пути
		const normalizedStart = ((startHeading % 360) + 360) % 360
		const normalizedTarget = ((targetHeading % 360) + 360) % 360

		// Вычисляем кратчайший путь поворота
		let diff = normalizedTarget - normalizedStart
		if (diff > 180) {
			diff -= 360
		} else if (diff < -180) {
			diff += 360
		}

		const animateFrame = () => {
			const currentTime = Date.now()
			const progress = Math.min((currentTime - startTime) / duration, 1)

			// Эффект easing для плавной анимации
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)

			const newHeading = startHeading + diff * easeOutQuart

			setAnimatedHeading(newHeading)
			oldHeading.current = newHeading

			if (progress < 1) {
				requestAnimationFrame(animateFrame)
			} else {
				// Убеждаемся, что конечное значение точно равно целевому
				setAnimatedHeading(targetHeading)
				setIsHeadingAnimating(false)
			}
		}

		requestAnimationFrame(animateFrame)
	}

	useEffect(() => {
		if (typeof oldHeading.current === 'number' && typeof props.heading === 'number') {
			animateHeading(props.heading, 300)
		}
	}, [props.heading])

	useEffect(() => {
		if (props.markerPosition && !isFirstRenderPosition.current) {
			oldMarkerPosition.current = props.markerPosition
			isFirstRenderPosition.current = true
		}
	}, [props.markerPosition])

	useEffect(() => {
		if (props.markerPosition && oldMarkerPosition.current) {
			animateToPosition(props.markerPosition, 500)
		}
	}, [props.markerPosition])

	const renderLines = (locations: IWorkoutLocationStorageItem[] | undefined) => {
		if (!locations || locations.length < 2) return null

		const activeLineColor = Colors['green-main']
		const pausedLineColor = Colors['gray-ab']

		const elements: JSX.Element[] = []

		// группируем подряд идущие точки по состоянию,
		// при смене состояния — добавляем точку-переход в конец предыдущей группы
		const groupedSegments: IWorkoutLocationStorageItem[][] = []
		const transitions: {
			groupIndex: number // индекс группы, после которой произошёл переход
			fromPaused: boolean
			toPaused: boolean
			point: IWorkoutLocationStorageItem // точка перехода (curr)
		}[] = []

		let currentGroup: IWorkoutLocationStorageItem[] = [locations[0]]

		for (let i = 1; i < locations.length; i++) {
			const prev = locations[i - 1]
			const curr = locations[i]

			const sameState = prev.isPausedPoint === curr.isPausedPoint

			if (sameState) {
				currentGroup.push(curr)
			} else {
				// включаем точку перехода в прошлую группу, чтобы получить сегмент prev -> curr
				currentGroup.push(curr)

				// сохраняем группу
				groupedSegments.push(currentGroup)

				// сохраняем инфу о переходе — группаIndex = индекс только что добавленной группы
				transitions.push({
					groupIndex: groupedSegments.length - 1,
					fromPaused: prev.isPausedPoint,
					toPaused: curr.isPausedPoint,
					point: curr
				})

				// начинаем новую группу с curr (curr дублируется — как конец прошлой и как начало новой)
				currentGroup = [curr]
			}
		}

		// добавляем последнюю группу
		if (currentGroup.length > 0) {
			groupedSegments.push(currentGroup)
		}

		// рендерим группы как единые линии
		groupedSegments.forEach((group, idx) => {
			const color = group[0].isPausedPoint ? pausedLineColor : activeLineColor

			const points = group.map((loc) => ({
				lat: loc.locationObject.coords.latitude,
				lon: loc.locationObject.coords.longitude
			}))

			elements.push(<Polyline key={`group-${idx}`} points={points} strokeColor={color} strokeWidth={4} />)

			// если после этой группы был переход — ставим маркер в точке перехода
			const transition = transitions.find((t) => t.groupIndex === idx)
			if (transition) {
				const { fromPaused, toPaused, point } = transition
				const pos = {
					lat: point.locationObject.coords.latitude,
					lon: point.locationObject.coords.longitude
				}

				if (!fromPaused && toPaused) {
					elements.push(<PauseLocationMarker key={`pause-${idx}`} position={pos} />)
				} else if (fromPaused && !toPaused) {
					elements.push(<ResumeLocationMarker key={`resume-${idx}`} position={pos} />)
				}
			}
		})

		return elements
	}

	// console.log('Render MapComponent') @TODO слишком частный ререндер
	return (
		<View className="flex-1" style={{ overflow: 'hidden', borderRadius: props.rounded || 0 }}>
			<Button variant="white" onPress={() => removeAllWorkoutStorage()}>
				REMOVE ALL WORKOUT STORAGE
			</Button>
			<Yamap
				nightMode
				initialRegion={{ ...(props.mapCenter ? props.mapCenter : DEFAULT_MAP_CENTER), zoom: 12 }}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				followUser // @TODO не работает
				showUserPosition={false}
				tiltGesturesEnabled={false}
				rotateGesturesEnabled={false}
			>
				{/*<DirectionMarkersDebug center={{ lat: 53.374451, lon: 49.460469 }} />*/}
				<UserLocationMarker
					position={animatedMarkerPosition}
					// position={{ lat: 53.374451, lon: 49.460469 }}
					accuracy={props.accuracy}
					heading={animatedHeading}
				/>

				{/*<PauseLocationMarker position={{ lat: 53.374451, lon: 49.460469 }} />*/}
				{/*<ResumeLocationMarker position={{ lat: 53.374451, lon: 49.560469 }} />*/}
				{/*<FinishLocationMarker position={{ lat: 53.374451, lon: 49.660469 }} />*/}

				{renderLines(props.userLocations)}
			</Yamap>
		</View>
	)
}

export default MapComponent
