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
	latestUserMarkerLocationRef?: React.RefObject<Point | null> | undefined
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
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(getMapSettings())

	// Используем useState только для триггера рендера при добавлении НОВЫХ сегментов
	const [, setForceRender] = useState(0)

	const segmentsRef = useRef<Segment[]>([])
	const transitionMarkersRef = useRef<TransitionMarker[]>([])
	const processedLocationCountRef = useRef<number>(0)

	// ждёт и старые и новые точки (processedCount)
	const updatePath = useCallback((locations: IWorkoutLocationStorageItem[]) => {
		// Если пришел пустой массив (или меньше чем было), значит сброс
		if (!locations || locations.length === 0) {
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

		// Работаем с текущим массивом сегментов
		const currentSegments = segmentsRef.current

		// Получаем последний сегмент
		let lastSegment = currentSegments.length > 0 ? currentSegments[currentSegments.length - 1] : null

		// Создаем аккумулятор точек для текущего сегмента.
		// Клонируем массив точек последнего сегмента, чтобы мутировать его локально в цикле.
		// Это предотвращает O(N^2) сложность, которая возникала при spread-операторе внутри цикла.
		let workingPoints: Point[] = lastSegment ? [...lastSegment.points] : []

		newLocations.forEach((loc) => {
			const newPoint: Point = {
				lat: loc.locationObject.coords.latitude,
				lon: loc.locationObject.coords.longitude
			}
			const isPaused = loc.isPausedPoint
			const expectedColor = isPaused ? pausedLineColor : activeLineColor

			if (!lastSegment) {
				// 1. Первый сегмент
				const newSeg: Segment = {
					points: [newPoint],
					color: expectedColor,
					polylineRef: React.createRef<PolylineComponentInstanceRef>()
				}
				currentSegments.push(newSeg)

				// Обновляем текущие рабочие переменные
				lastSegment = newSeg
				workingPoints = newSeg.points
				hasStructureChanged = true
				return
			}

			if (lastSegment.color === expectedColor) {
				// 2. Состояние не изменилось -> просто добавляем точку в аккумулятор
				workingPoints.push(newPoint)
			} else {
				// 3. Состояние изменилось -> сохраняем текущий сегмент и создаем новый

				// Сначала фиксируем точки в завершенном сегменте
				lastSegment.points = workingPoints
				// Если структура меняется, React обновит это при ререндере.
				// Если бы мы не делали ререндер, нужно было бы обновить setNativeProps для этого сегмента здесь.
				// Но так как hasStructureChanged станет true, ререндер произойдет в конце.

				hasStructureChanged = true

				// Берем последнюю точку предыдущего сегмента для связки, если массив не пустой
				if (workingPoints.length > 0) {
					const transitionPoint = workingPoints[workingPoints.length - 1]
					transitionMarkersRef.current.push({
						id: `tm-${Date.now()}-${Math.random()}`,
						type: isPaused ? 'pause' : 'resume',
						position: transitionPoint
					})

					const newSeg: Segment = {
						points: [transitionPoint, newPoint],
						color: expectedColor,
						polylineRef: React.createRef<PolylineComponentInstanceRef>()
					}
					currentSegments.push(newSeg)

					// Переключаемся на новый сегмент
					lastSegment = newSeg
					workingPoints = newSeg.points
				} else {
					// Fallback если вдруг workingPoints пуст (не должно происходить при нормальной логике)
					const newSeg: Segment = {
						points: [newPoint],
						color: expectedColor,
						polylineRef: React.createRef<PolylineComponentInstanceRef>()
					}
					currentSegments.push(newSeg)
					lastSegment = newSeg
					workingPoints = newSeg.points
				}
			}
		})

		// В конце цикла обновляем точки в последнем активном сегменте из аккумулятора
		if (lastSegment) {
			lastSegment.points = workingPoints
		}

		if (hasStructureChanged) {
			// Если структура изменилась (добавились сегменты или маркеры), вызываем полный ререндер.
			// React отрисует новые сегменты с обновленными массивами точек.
			setForceRender((prev) => prev + 1)
		} else {
			// Оптимизация: Если структура НЕ изменилась, мы просто обновили массив точек последнего сегмента.
			// Чтобы не вызывать тяжелый ререндер React, обновляем только Native Props через ref.
			if (lastSegment && lastSegment.polylineRef.current) {
				lastSegment.polylineRef.current.setNativeProps({ points: workingPoints })
			}
		}
	}, [])

	// Инициализация при маунте, если переданы initialLocations
	// useEffect(() => {
	// 	if (props.initialLocations && props.initialLocations.length > 0 && processedLocationCountRef.current === 0) {
	// 		updatePath(props.initialLocations)
	// 	}
	// }, [props.initialLocations, updatePath])

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

	const shouldRenderMap =
		(!!props.maxMapHeight && props.maxMapHeight > 0) || (!!props.maxContainerHeight && props.maxContainerHeight > 0)

	const markerPosition = props.latestUserMarkerLocationRef?.current || props.initialMarkerLocation
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
			{shouldRenderMap && (
				<Yamap
					ref={mapRef}
					nightMode
					initialRegion={mapInitialRegionSettingsRef.current}
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
							const newSettings = {
								lat: pos.point.lat,
								lon: pos.point.lon,
								zoom: pos.zoom,
								azimuth: pos.azimuth
							}
							updateMapSettingsDebounced(newSettings)
							mapInitialRegionSettingsRef.current = {
								...mapInitialRegionSettingsRef.current,
								...newSettings
							}
						})
					}}
				>
					<UserLocationMarker ref={props.userLocationMarkerRef} initialPosition={markerPosition} />

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
			)}
		</View>
	)
})

MapComponentSegments.displayName = 'MapComponentSegments'

export default React.memo(MapComponentSegments, (prev, next) => {
	const layoutPropsEqual =
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.maxMapHeight === next.maxMapHeight &&
		prev.minMapHeight === next.minMapHeight &&
		prev.rounded === next.rounded &&
		prev.initialMarkerLocation === next.initialMarkerLocation &&
		prev.userLocationMarkerRef === next.userLocationMarkerRef &&
		prev.latestUserMarkerLocationRef === next.latestUserMarkerLocationRef

	if (!layoutPropsEqual) {
		return false
	}

	if (prev.initialLocations === next.initialLocations) return true

	const prevLen = prev.initialLocations ? prev.initialLocations.length : 0
	const nextLen = next.initialLocations ? next.initialLocations.length : 0

	return prevLen === nextLen
})
