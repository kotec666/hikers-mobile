import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'
import { IWorkoutLocationStorageItem, removeAllWorkoutStorage } from '@/store/workoutStorage'
import { Colors } from '@/constants/Colors'
import { Button } from '@/components/ui/Button'
import { debounce } from '@/helpers/debounce'
import PauseLocationMarker from '@/components/map/markers/PauseLocationMarker'
import ResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker'
import StartLocationMarker from '@/components/map/markers/StartLocationMarker'
import { getMapSettings, updateMapSettings } from '@/store/mapStorage'
import { PolylineComponentInstanceRef, PolylineCustom } from '@/components/map/PolylineCustom'
import { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'
import UserLocationMarker, {
	UserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/UserLocationMarker'

export interface ILatLng {
	lat: number
	lon: number
}

interface IProps {
	maxMapHeight?: number
	maxContainerHeight?: number
	minMapHeight?: number
	rounded?: number
	initialMarkerLocation?: ILatLng | null // @TODO заменить везде на Point из ya-map?
	userLocationMarkerRef?: React.RefObject<UserLocationMarkerHandle | null>
	initialLocations?: IWorkoutLocationStorageItem[]
}

export interface MapComponentHandle {
	setMapCenter: (center: ILatLng | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
	fitAllMarkers: (durationInSeconds?: number) => void
	updatePath: (newItem: IWorkoutLocationStorageItem) => void
}

interface Segment {
	isPaused: boolean
	points: Point[]
	color: string
}

interface TransitionMarker {
	type: 'pause' | 'resume'
	position: Point
	id: string
}

// const testLocations = [
// 	{
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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
// 		relTs: 1,
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

const MapComponent = forwardRef<MapComponentHandle, IProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	// State for React rendering of segments and markers
	const [segments, setSegments] = useState<Segment[]>([])
	const [transitionMarkers, setTransitionMarkers] = useState<TransitionMarker[]>([])

	// Ref for the CURRENT active segment points.
	// This allows us to mutate the array and use setNativeProps for performance,
	// while ensuring we don't mutate the React state (which might be frozen).
	const currentSegmentPointsRef = useRef<Point[]>([])

	// Ref для хранения состояния последнего сегмента.
	// Важно: используем ref вместо segments[last].isPaused, чтобы иметь актуальное значение
	// внутри императивного метода updatePath, не завися от замыкания и рендеров React.
	const lastSegmentPausedRef = useRef<boolean>(false)

	const activePolylineRef = useRef<PolylineComponentInstanceRef | null>(null)
	const isAnimationBlocked = useRef<boolean>(false)
	const animationBlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const mapInitialRegionSettings = useRef<InitialRegion>(getMapSettings()).current

	const activeLineColor = Colors['green-main']
	const pausedLineColor = Colors['gray-ab']

	// Initialize from props (History load)
	useEffect(() => {
		if (props.initialLocations && props.initialLocations.length > 0 && segments.length === 0) {
			const parsed = parseLocationsToSegments(props.initialLocations)
			setSegments(parsed.segments)
			setTransitionMarkers(parsed.markers)

			if (parsed.segments.length > 0) {
				// Клонируем точки для мутаций
				currentSegmentPointsRef.current = [...parsed.segments[parsed.segments.length - 1].points]
				// Синхронизируем ref состояния
				lastSegmentPausedRef.current = parsed.segments[parsed.segments.length - 1].isPaused
			}
		}
	}, [])

	const parseLocationsToSegments = (locations: IWorkoutLocationStorageItem[]) => {
		if (!locations || locations.length === 0) return { segments: [], markers: [] }

		const resultSegments: Segment[] = []
		const markers: TransitionMarker[] = []

		let currentGroup: IWorkoutLocationStorageItem[] = [locations[0]]

		for (let i = 1; i < locations.length; i++) {
			const prev = locations[i - 1]
			const curr = locations[i]

			const sameState = prev.isPausedPoint === curr.isPausedPoint

			if (sameState) {
				currentGroup.push(curr)
			} else {
				// Connect segments visually
				currentGroup.push(curr)

				resultSegments.push({
					isPaused: prev.isPausedPoint,
					points: currentGroup.map((l) => ({
						lat: l.locationObject.coords.latitude,
						lon: l.locationObject.coords.longitude
					})),
					color: prev.isPausedPoint ? pausedLineColor : activeLineColor
				})

				markers.push({
					type: prev.isPausedPoint ? 'resume' : 'pause',
					position: { lat: curr.locationObject.coords.latitude, lon: curr.locationObject.coords.longitude },
					id: `marker-${i}`
				})

				currentGroup = [curr]
			}
		}

		// Add the final group
		if (currentGroup.length > 0) {
			resultSegments.push({
				isPaused: currentGroup[0].isPausedPoint,
				points: currentGroup.map((l) => ({
					lat: l.locationObject.coords.latitude,
					lon: l.locationObject.coords.longitude
				})),
				color: currentGroup[0].isPausedPoint ? pausedLineColor : activeLineColor
			})
		}

		return { segments: resultSegments, markers }
	}

	const updatePath = useCallback(
		(newItem: IWorkoutLocationStorageItem) => {
			const newPoint: Point = {
				lat: newItem.locationObject.coords.latitude,
				lon: newItem.locationObject.coords.longitude
			}

			// Case 0: No segments exist yet
			if (segments.length === 0 && currentSegmentPointsRef.current.length === 0) {
				const newSegment: Segment = {
					isPaused: newItem.isPausedPoint,
					points: [newPoint],
					color: newItem.isPausedPoint ? pausedLineColor : activeLineColor
				}
				currentSegmentPointsRef.current = [newPoint]
				lastSegmentPausedRef.current = newItem.isPausedPoint
				setSegments([newSegment])
				return
			}

			// Используем ref для проверки состояния, так как state segments может быть "старым" в замыкании
			// если обновления идут часто, но ререндер еще не произошел.
			const isStateSame = lastSegmentPausedRef.current === newItem.isPausedPoint

			if (isStateSame) {
				// === SAME STATE: OPTIMIZED UPDATE (NO RENDER) ===
				// 1. Update Ref (mutable)
				currentSegmentPointsRef.current.push(newPoint)

				// 2. Update Native View directly
				if (activePolylineRef.current) {
					activePolylineRef.current.setNativeProps({
						points: currentSegmentPointsRef.current
					} as PolylineNativeProps)
				}
			} else {
				// === STATE CHANGE: TRIGGER REACT RENDER ===

				// 1. Seal the previous segment
				const finishedSegmentPoints = [...currentSegmentPointsRef.current, newPoint]

				// 2. Start new segment
				const newSegmentStartPoints = [newPoint]
				currentSegmentPointsRef.current = [...newSegmentStartPoints]

				// Обновляем статус в ref
				lastSegmentPausedRef.current = newItem.isPausedPoint

				const newSegment: Segment = {
					isPaused: newItem.isPausedPoint,
					points: newSegmentStartPoints,
					color: newItem.isPausedPoint ? pausedLineColor : activeLineColor
				}

				// 3. Update State to create new Polyline component (Triggers Render)
				setSegments((prev) => {
					const copy = [...prev]
					if (copy.length > 0) {
						// Update the sealed segment in history
						copy[copy.length - 1] = {
							...copy[copy.length - 1],
							points: finishedSegmentPoints
						}
					}
					return [...copy, newSegment]
				})

				setTransitionMarkers((prev) => [
					...prev,
					{
						type: !newItem.isPausedPoint ? 'resume' : 'pause',
						position: newPoint,
						id: `trans-${Date.now()}`
					}
				])
			}
		},
		[segments, activeLineColor, pausedLineColor]
	)

	useImperativeHandle(ref, () => ({
		setMapCenter: (center, durationInSeconds, zoom, animationType) =>
			changeMapCenter(center, durationInSeconds, zoom, animationType),
		fitAllMarkers: (durationInSeconds) => fitAllMarkers(durationInSeconds),
		updatePath: (newItem) => updatePath(newItem)
	}))

	// const renderLines = (locations: IWorkoutLocationStorageItem[] | undefined) => {
	// 	if (!locations || locations.length < 2) return null
	//
	// 	const activeLineColor = Colors['green-main']
	// 	const pausedLineColor = Colors['gray-ab']
	//
	// 	const elements: JSX.Element[] = []
	//
	// 	// группируем подряд идущие точки по состоянию,
	// 	// при смене состояния — добавляем точку-переход в конец предыдущей группы
	// 	const groupedSegments: IWorkoutLocationStorageItem[][] = []
	// 	const transitions: {
	// 		groupIndex: number // индекс группы, после которой произошёл переход
	// 		fromPaused: boolean
	// 		toPaused: boolean
	// 		point: IWorkoutLocationStorageItem // точка перехода (curr)
	// 	}[] = []
	//
	// 	let currentGroup: IWorkoutLocationStorageItem[] = [locations[0]]
	//
	// 	for (let i = 1; i < locations.length; i++) {
	// 		const prev = locations[i - 1]
	// 		const curr = locations[i]
	//
	// 		const sameState = prev.isPausedPoint === curr.isPausedPoint
	//
	// 		if (sameState) {
	// 			currentGroup.push(curr)
	// 		} else {
	// 			// включаем точку перехода в прошлую группу, чтобы получить сегмент prev -> curr
	// 			currentGroup.push(curr)
	//
	// 			// сохраняем группу
	// 			groupedSegments.push(currentGroup)
	//
	// 			// сохраняем инфу о переходе — группаIndex = индекс только что добавленной группы
	// 			transitions.push({
	// 				groupIndex: groupedSegments.length - 1,
	// 				fromPaused: prev.isPausedPoint,
	// 				toPaused: curr.isPausedPoint,
	// 				point: curr
	// 			})
	//
	// 			// начинаем новую группу с curr (curr дублируется — как конец прошлой и как начало новой)
	// 			currentGroup = [curr]
	// 		}
	// 	}
	//
	// 	// добавляем последнюю группу
	// 	if (currentGroup.length > 0) {
	// 		groupedSegments.push(currentGroup)
	// 	}
	//
	// 	// рендерим группы как единые линии
	// 	groupedSegments.forEach((group, idx) => {
	// 		const color = group[0].isPausedPoint ? pausedLineColor : activeLineColor
	//
	// 		const points = group.map((loc) => ({
	// 			lat: loc.locationObject.coords.latitude,
	// 			lon: loc.locationObject.coords.longitude
	// 		}))
	//
	// 		elements.push(
	// 			<PolylineCustom
	// 				ref={(elem) => {
	// 					if (elem) {
	// 						polylineRef.current.push(elem)
	// 					}
	// 				}}
	// 				key={`group-${idx}`}
	// 				points={points}
	// 				strokeColor={color}
	// 				strokeWidth={4}
	// 			/>
	// 		)
	//
	// 		// если после этой группы был переход — ставим маркер в точке перехода
	// 		const transition = transitions.find((t) => t.groupIndex === idx)
	// 		if (transition) {
	// 			const { fromPaused, toPaused, point } = transition
	// 			const pos = {
	// 				lat: point.locationObject.coords.latitude,
	// 				lon: point.locationObject.coords.longitude
	// 			}
	//
	// 			if (!fromPaused && toPaused) {
	// 				elements.push(<PauseLocationMarker key={`pause-${idx}`} position={pos} />)
	// 			} else if (fromPaused && !toPaused) {
	// 				elements.push(<ResumeLocationMarker key={`resume-${idx}`} position={pos} />)
	// 			}
	// 		}
	// 	})
	//
	// 	return elements
	// }
	//
	// const renderedLines = useMemo(() => renderLines(props.userLocations), [props.userLocations])

	const fitAllMarkers = (durationInSeconds?: number) => {
		if (!mapRef.current) return
		mapRef.current.fitAllMarkers(durationInSeconds, Animation.LINEAR)
	}

	const changeMapCenter = (
		center: ILatLng | null,
		durationInSeconds?: number,
		zoom?: number,
		animationType?: Animation
	) => {
		if (isAnimationBlocked.current) return
		if (!center) return
		if (!mapRef.current) return
		mapRef.current.getCameraPosition((cameraPosition) => {
			const zoomToUse = zoom ?? cameraPosition.zoom
			const azimuthToUse = cameraPosition.azimuth

			// Проверяем, изменилось ли что-то
			if (
				cameraPosition.point.lat === center.lat &&
				cameraPosition.point.lon === center.lon &&
				cameraPosition.zoom === zoomToUse &&
				cameraPosition.azimuth === azimuthToUse
			) {
				return
			}

			if (!mapRef.current) return
			mapRef.current.setCenter(
				center,
				zoomToUse,
				azimuthToUse,
				durationInSeconds ?? 1,
				animationType ?? Animation.SMOOTH
			)
		})
	}

	const handleBlockAnimation = useCallback(() => {
		if (animationBlockTimer.current) {
			clearTimeout(animationBlockTimer.current)
		}

		isAnimationBlocked.current = true

		animationBlockTimer.current = setTimeout(() => {
			isAnimationBlocked.current = false
		}, 2000)
	}, [])

	const updateMapSettingsDebounced = debounce(updateMapSettings, 300)

	console.log('Render MapComponent')
	return (
		<View
			className="flex-1"
			style={{
				overflow: 'hidden',
				borderRadius: props.rounded || 0,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<Button variant="white" onPress={() => removeAllWorkoutStorage()}>
				REMOVE ALL WORKOUT STORAGE
			</Button>
			<Yamap
				ref={mapRef}
				nightMode
				initialRegion={mapInitialRegionSettings}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				showUserPosition={false}
				tiltGesturesDisabled={true}
				rotateGesturesDisabled={true} // @TODO включить после дебага
				onCameraPositionChange={(e) => {
					//@TODO Может влиять на 2д/3д режимы. Мб блокировать анимацию также с причиной APPLICATION, а когда анимация кончилась - можно впускать дальше
					if (['GESTURES', 'UNKNOWN'].includes(e.nativeEvent.reason)) {
						handleBlockAnimation()
					}
				}}
				onCameraPositionChangeEnd={() => {
					mapRef.current?.getCameraPosition((pos) => {
						updateMapSettingsDebounced({
							lat: pos.point.lat,
							lon: pos.point.lon,
							zoom: pos.zoom,
							azimuth: pos.azimuth
						})
					})
				}}
			>
				{/*<DirectionMarkersDebug center={{ lat: 53.374451, lon: 49.460469 }} />*/}
				{props.initialMarkerLocation && (
					<UserLocationMarker
						ref={props.userLocationMarkerRef}
						initialPosition={props.initialMarkerLocation}
					/>
				)}

				{props.initialLocations && props.initialLocations?.length >= 1 && (
					<StartLocationMarker
						position={{
							lat: props.initialLocations[0].locationObject.coords.latitude,
							lon: props.initialLocations[0].locationObject.coords.longitude
						}}
					/>
				)}

				{/* Render Dynamic Segments */}
				{segments.map((segment, index) => {
					const isLast = index === segments.length - 1
					return (
						<PolylineCustom
							key={`poly-${index}`}
							ref={isLast ? activePolylineRef : undefined} // Only attach ref to the active segment
							points={segment.points}
							strokeColor={segment.color}
							strokeWidth={4}
						/>
					)
				})}

				{/* Render Transition Markers */}
				{transitionMarkers.map((tm) =>
					tm.type === 'pause' ? (
						<PauseLocationMarker key={tm.id} position={tm.position} />
					) : (
						<ResumeLocationMarker key={tm.id} position={tm.position} />
					)
				)}

				{/*<PauseLocationMarker position={{ lat: 53.374451, lon: 49.460469 }} />*/}
				{/*<ResumeLocationMarker position={{ lat: 53.374451, lon: 49.460489 }} />*/}
				{/*<FinishLocationMarker position={{ lat: 53.374451, lon: 49.660469 }} />*/}

				{/*{renderedLines}*/}
			</Yamap>
		</View>
	)
})

MapComponent.displayName = 'MapComponent'

// Memo: Сравниваем пропсы. initialLocations сравниваем по ссылке.
// Так как в NewTraining мы передаем initialLocations = myLocationsRef.current,
// а ref.current всегда стабилен (даже если массив внутри мутирует),
// React.memo вернет true и ререндер не произойдет при обновлении массива.
export default React.memo(MapComponent, (prev, next) => {
	return (
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.maxMapHeight === next.maxMapHeight &&
		prev.minMapHeight === next.minMapHeight &&
		prev.rounded === next.rounded &&
		prev.initialMarkerLocation === next.initialMarkerLocation &&
		prev.userLocationMarkerRef === next.userLocationMarkerRef &&
		prev.initialLocations === next.initialLocations
	)
})
