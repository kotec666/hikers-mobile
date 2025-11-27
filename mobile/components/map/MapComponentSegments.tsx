import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
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
import UserLocationMarker, {
	UserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/UserLocationMarker'

interface IProps {
	maxMapHeight?: number
	maxContainerHeight?: number
	minMapHeight?: number
	rounded?: number
	initialMarkerLocation?: Point | null
	userLocationMarkerRef?: React.RefObject<UserLocationMarkerHandle | null>
	initialLocations?: IWorkoutLocationStorageItem[]
}

export interface MapComponentSegmentsHandle {
	setMapCenter: (center: Point | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
	fitAllMarkers: (durationInSeconds?: number) => void
	updatePath: (newItem: IWorkoutLocationStorageItem[]) => void
}

interface Segment {
	points: Point[]
	color: string
	polylineRef: React.RefObject<PolylineComponentInstanceRef | null>
}

interface TransitionMarker {
	id: string
	type: 'pause' | 'resume'
	position: Point
}

const MapComponentSegments = forwardRef<MapComponentSegmentsHandle, IProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const animationBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(getMapSettings()).current

	// Используем useState только для триггера рендера при добавлении НОВЫХ сегментов
	const [, setForceRender] = useState(0)

	const segmentsRef = useRef<Segment[]>([])
	const transitionMarkersRef = useRef<TransitionMarker[]>([])
	const processedLocationCountRef = useRef<number>(0)

	const updatePath = useCallback((locations: IWorkoutLocationStorageItem[]) => {
		if (!locations) return

		// Если пришел пустой массив (или меньше чем было), значит сброс
		if (locations.length === 0) {
			segmentsRef.current = []
			transitionMarkersRef.current = []
			processedLocationCountRef.current = 0
			setForceRender((prev) => prev + 1)
			return
		}

		// Логика дедупликации: обрабатываем только новые точки
		const processedCount = processedLocationCountRef.current
		if (locations.length <= processedCount) {
			// Ничего нового (или пришел старый стейт), игнорируем
			return
		}

		// Берем только хвост массива
		const newLocations = locations.slice(processedCount)
		processedLocationCountRef.current = locations.length

		const activeLineColor = Colors['green-main']
		const pausedLineColor = Colors['gray-ab']

		let hasStructureChanged = false

		// Создаем копии массивов, чтобы избежать мутаций замороженных объектов
		const currentSegments = [...segmentsRef.current]
		const currentMarkers = [...transitionMarkersRef.current]

		newLocations.forEach((loc) => {
			const newPoint: Point = {
				lat: loc.locationObject.coords.latitude,
				lon: loc.locationObject.coords.longitude
			}
			const isPaused = loc.isPausedPoint
			const expectedColor = isPaused ? pausedLineColor : activeLineColor

			const lastSegment = currentSegments[currentSegments.length - 1]

			if (!lastSegment) {
				// 1. Первый сегмент
				currentSegments.push({
					points: [newPoint],
					color: activeLineColor, // Обычно начинаем с активного
					polylineRef: React.createRef<PolylineComponentInstanceRef>()
				})
				hasStructureChanged = true
				return
			}

			const lastSegmentColor = lastSegment.color

			if (lastSegmentColor === expectedColor) {
				// 2. Состояние не изменилось -> обновляем существующий сегмент
				// Создаем новый массив точек для иммутабельности
				const newPoints = [...lastSegment.points, newPoint]
				lastSegment.points = newPoints
				lastSegment.polylineRef.current?.setNativeProps({ points: newPoints })
			} else {
				// 3. Состояние изменилось -> создаём transition marker и новый сегмент
				hasStructureChanged = true

				// Берем последнюю точку предыдущего сегмента для связки
				const transitionPoint = lastSegment.points[lastSegment.points.length - 1]

				currentMarkers.push({
					id: `tm-${Date.now()}-${Math.random()}`,
					type: isPaused ? 'pause' : 'resume',
					position: transitionPoint
				})

				currentSegments.push({
					points: [transitionPoint, newPoint],
					color: expectedColor,
					polylineRef: React.createRef<PolylineComponentInstanceRef>()
				})
			}
		})

		// Обновляем рефы
		segmentsRef.current = currentSegments
		transitionMarkersRef.current = currentMarkers

		if (hasStructureChanged) {
			setForceRender((prev) => prev + 1)
		}
	}, [])

	// Инициализация при маунте, если переданы initialLocations
	useEffect(() => {
		if (props.initialLocations && props.initialLocations.length > 0 && processedLocationCountRef.current === 0) {
			updatePath(props.initialLocations)
		}
	}, [props.initialLocations, updatePath])

	useImperativeHandle(ref, () => ({
		setMapCenter: (center, durationInSeconds, zoom, animationType) =>
			changeMapCenter(center, durationInSeconds, zoom, animationType),
		fitAllMarkers: (durationInSeconds) => fitAllMarkers(durationInSeconds),
		updatePath: (newItems) => updatePath(newItems)
	}))

	const fitAllMarkers = (durationInSeconds?: number) => {
		if (!mapRef.current) return
		mapRef.current.fitAllMarkers(durationInSeconds, Animation.LINEAR)
	}

	const changeMapCenter = (
		center: Point | null,
		durationInSeconds?: number,
		zoom?: number,
		animationType?: Animation
	) => {
		if (isAnimationBlockedRef.current) return
		if (!center) return
		if (!mapRef.current) return
		mapRef.current.getCameraPosition((cameraPosition) => {
			if (!mapRef.current) return
			handleBlockAnimation(durationInSeconds)
			mapRef.current.setCenter(
				center,
				zoom ?? cameraPosition.zoom,
				undefined,
				undefined,
				durationInSeconds ?? 1,
				animationType ?? Animation.SMOOTH
			)
		})
	}

	const handleBlockAnimation = useCallback((durationInMS: number = 2000) => {
		if (animationBlockTimerRef.current) {
			clearTimeout(animationBlockTimerRef.current)
		}

		isAnimationBlockedRef.current = true

		animationBlockTimerRef.current = setTimeout(() => {
			isAnimationBlockedRef.current = false
			animationBlockTimerRef.current = null
		}, durationInMS)
	}, [])

	const updateMapSettingsDebounced = debounce(updateMapSettings, 300)

	useEffect(() => {
		return () => {
			if (animationBlockTimerRef.current) {
				clearTimeout(animationBlockTimerRef.current)
			}
		}
	}, [])

	const startPosition = useMemo(() => {
		if (props.initialLocations && props.initialLocations.length > 0) {
			const startPoint = props.initialLocations[0]
			return {
				lat: startPoint.locationObject.coords.latitude,
				lon: startPoint.locationObject.coords.longitude
			}
		}
		return null
	}, [props.initialLocations])

	console.log('Render MapComponent')
	return (
		<View
			style={{
				flex: 1,
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
				initialRegion={mapInitialRegionSettingsRef}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				showUserPosition={false}
				tiltGesturesDisabled={true}
				rotateGesturesDisabled={true} // @TODO включить после дебага
				onCameraPositionChange={(e) => {
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

				{startPosition && <StartLocationMarker position={startPosition} />}

				{segmentsRef.current.map((seg, idx) => (
					<PolylineCustom
						key={idx}
						ref={seg.polylineRef}
						points={seg.points}
						strokeColor={seg.color}
						strokeWidth={4}
					/>
				))}

				{transitionMarkersRef.current.map((tm) =>
					tm.type === 'pause' ? (
						<PauseLocationMarker key={tm.id} position={tm.position} />
					) : (
						<ResumeLocationMarker key={tm.id} position={tm.position} />
					)
				)}

				{/*<FinishLocationMarker position={{ lat: 53.374451, lon: 49.660469 }} />*/}
			</Yamap>
		</View>
	)
})

MapComponentSegments.displayName = 'MapComponentSegments'

// Memo: Сравниваем пропсы. initialLocations сравниваем по ссылке.
// Так как в NewTraining мы передаем initialLocations = myLocationsRef.current,
// а ref.current всегда стабилен (даже если массив внутри мутирует),
// React.memo вернет true и ререндер не произойдет при обновлении массива.
export default React.memo(MapComponentSegments, (prev, next) => {
	const baseEqual =
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.maxMapHeight === next.maxMapHeight &&
		prev.minMapHeight === next.minMapHeight &&
		prev.rounded === next.rounded &&
		prev.initialMarkerLocation === next.initialMarkerLocation &&
		prev.userLocationMarkerRef === next.userLocationMarkerRef &&
		prev.initialLocations === next.initialLocations

	if (baseEqual) return true

	return (
		Array.isArray(prev.initialLocations) &&
		Array.isArray(next.initialLocations) &&
		prev.initialLocations.length === next.initialLocations.length &&
		prev.initialLocations.every((p, i) => p === next.initialLocations?.[i])
	)
})
