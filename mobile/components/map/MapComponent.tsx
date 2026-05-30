import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { Colors } from '@/constants/Colors'
import { debounce } from '@/helpers/debounce'
import YaMapPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/YaMapPauseLocationMarker'
import YaMapResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/YaMapResumeLocationMarker'
import YaMapStartLocationMarker from '@/components/map/markers/StartLocationMarker/YaMapStartLocationMarker'
import YaMapFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/YaMapFinishLocationMarker'
import { getYaMapSettings, updateYaMapSettings } from '@/store/yaMapStorage'
import { PolylineComponentInstanceRef, PolylineCustom } from '@/components/map/PolylineCustom'
import { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'
import YaMapUserLocationMarker, {
	YaMapUserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'

interface IProps {
	needSaveCenter?: boolean
	needFinishMarker?: boolean
	interactiveDisabled?: boolean
	maxMapHeight?: number
	maxContainerHeight?: number
	minMapHeight?: number
	rounded?: number
	logoPosition?: {
		horizontal?: 'left' | 'center' | 'right'
		vertical?: 'top' | 'bottom'
	}
	logoPadding?: {
		horizontal?: number
		vertical?: number
	}
	deferInitialRouteRender?: boolean
	initialMarkerLocation?: Point | null
	userLocationMarkerRef?: React.RefObject<YaMapUserLocationMarkerHandle | null>
	initialLocations?: React.RefObject<IWorkoutLocationStorageItem[]>
}

export interface MapComponentHandle {
	setMapCenter: (center: Point | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
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

const activeLineColor = Colors['green-main']
const pausedLineColor = Colors['gray-ab']

const getLocationPoint = (location: IWorkoutLocationStorageItem): Point => ({
	lat: location.locationObject.coords.latitude,
	lon: location.locationObject.coords.longitude
})

const getRoutePoints = (locations?: IWorkoutLocationStorageItem[]): Point[] => {
	if (!locations || locations.length === 0) return []

	return locations.map(getLocationPoint)
}

const getInitialRouteZoom = (points: Point[]) => {
	if (points.length <= 1) return 16

	const bounds = points.reduce(
		(acc, point) => ({
			minLat: Math.min(acc.minLat, point.lat),
			maxLat: Math.max(acc.maxLat, point.lat),
			minLon: Math.min(acc.minLon, point.lon),
			maxLon: Math.max(acc.maxLon, point.lon)
		}),
		{
			minLat: points[0].lat,
			maxLat: points[0].lat,
			minLon: points[0].lon,
			maxLon: points[0].lon
		}
	)

	const maxDelta = Math.max(bounds.maxLat - bounds.minLat, bounds.maxLon - bounds.minLon)

	if (maxDelta < 0.005) return 16
	if (maxDelta < 0.01) return 15
	if (maxDelta < 0.025) return 14
	if (maxDelta < 0.05) return 13
	if (maxDelta < 0.1) return 12
	if (maxDelta < 0.25) return 11
	if (maxDelta < 0.5) return 10
	if (maxDelta < 1) return 9

	return 8
}

const getRouteInitialRegion = (points: Point[], fallback: InitialRegion): InitialRegion => {
	if (points.length === 0) return fallback

	const bounds = points.reduce(
		(acc, point) => ({
			minLat: Math.min(acc.minLat, point.lat),
			maxLat: Math.max(acc.maxLat, point.lat),
			minLon: Math.min(acc.minLon, point.lon),
			maxLon: Math.max(acc.maxLon, point.lon)
		}),
		{
			minLat: points[0].lat,
			maxLat: points[0].lat,
			minLon: points[0].lon,
			maxLon: points[0].lon
		}
	)

	return {
		...fallback,
		lat: (bounds.minLat + bounds.maxLat) / 2,
		lon: (bounds.minLon + bounds.maxLon) / 2,
		zoom: getInitialRouteZoom(points),
		azimuth: undefined
	}
}

const parseLocationsToSegments = (locations: IWorkoutLocationStorageItem[]) => {
	if (!locations || locations.length === 0) return { segments: [], markers: [] }

	const resultSegments: Segment[] = []
	const markers: TransitionMarker[] = []

	let currentGroup: IWorkoutLocationStorageItem[] = [locations[0]]

	for (let i = 1; i < locations.length; i++) {
		const prev = locations[i - 1]
		const curr = locations[i]

		const sameState = prev.paused === curr.paused

		if (sameState) {
			currentGroup.push(curr)
		} else {
			// Connect segments visually
			currentGroup.push(curr)

			resultSegments.push({
				isPaused: prev.paused,
				points: currentGroup.map(getLocationPoint),
				color: prev.paused ? pausedLineColor : activeLineColor
			})

			markers.push({
				type: prev.paused ? 'resume' : 'pause',
				position: getLocationPoint(curr),
				id: `marker-${i}`
			})

			currentGroup = [curr]
		}
	}

	// Add the final group
	if (currentGroup.length > 0) {
		resultSegments.push({
			isPaused: currentGroup[0].paused,
			points: currentGroup.map(getLocationPoint),
			color: currentGroup[0].paused ? pausedLineColor : activeLineColor
		})
	}

	return { segments: resultSegments, markers }
}

const MapComponent = forwardRef<MapComponentHandle, IProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	const shouldDeferInitialRouteRender = props.deferInitialRouteRender ?? true
	const [initialRouteData] = useState(() =>
		shouldDeferInitialRouteRender ? null : parseLocationsToSegments(props.initialLocations?.current || [])
	)
	const [initialRoutePoints] = useState(() =>
		shouldDeferInitialRouteRender ? [] : getRoutePoints(props.initialLocations?.current)
	)
	// State for React rendering of segments and markers
	const [segments, setSegments] = useState<Segment[]>(initialRouteData?.segments || [])
	const [transitionMarkers, setTransitionMarkers] = useState<TransitionMarker[]>(initialRouteData?.markers || [])

	const initialLastSegment =
		initialRouteData && initialRouteData.segments.length > 0
			? initialRouteData.segments[initialRouteData.segments.length - 1]
			: null

	// Ref for the CURRENT active segment points.
	// This allows us to mutate the array and use setNativeProps for performance,
	// while ensuring we don't mutate the React state (which might be frozen).
	const currentSegmentPointsRef = useRef<Point[]>(initialLastSegment ? [...initialLastSegment.points] : [])

	// Ref для хранения состояния последнего сегмента.
	// Важно: используем ref вместо segments[last].isPaused, чтобы иметь актуальное значение
	// внутри императивного метода updatePath, не завися от замыкания и рендеров React.
	const lastSegmentPausedRef = useRef<boolean>(initialLastSegment?.isPaused ?? false)

	const activePolylineRef = useRef<PolylineComponentInstanceRef | null>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const animationBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(
		getRouteInitialRegion(initialRoutePoints, getYaMapSettings())
	).current

	// Initialize from props (History load)
	useEffect(() => {
		let idleId: number | null = null

		const run = () => {
			if (props.initialLocations?.current && props.initialLocations.current.length > 0 && segments.length === 0) {
				const parsed = parseLocationsToSegments(props.initialLocations.current)
				setSegments(parsed.segments)
				setTransitionMarkers(parsed.markers)

				if (parsed.segments.length > 0) {
					// Клонируем точки для мутаций
					currentSegmentPointsRef.current = [...parsed.segments[parsed.segments.length - 1].points]
					// Синхронизируем ref состояния
					lastSegmentPausedRef.current = parsed.segments[parsed.segments.length - 1].isPaused
				}
			}
		}

		idleId = requestIdleCallback(run)

		return () => {
			if (idleId) cancelIdleCallback(idleId)
		}
	}, [props.initialLocations, segments.length])

	const updatePath = useCallback(
		(newItem: IWorkoutLocationStorageItem) => {
			const newPoint: Point = {
				lat: newItem.locationObject.coords.latitude,
				lon: newItem.locationObject.coords.longitude
			}

			// Case 0: No segments exist yet
			if (segments.length === 0 && currentSegmentPointsRef.current.length === 0) {
				const newSegment: Segment = {
					isPaused: newItem.paused,
					points: [newPoint],
					color: newItem.paused ? pausedLineColor : activeLineColor
				}
				currentSegmentPointsRef.current = [newPoint]
				lastSegmentPausedRef.current = newItem.paused
				setSegments([newSegment])
				return
			}

			// Используем ref для проверки состояния, так как state segments может быть "старым" в замыкании
			// если обновления идут часто, но ререндер еще не произошел.
			const isStateSame = lastSegmentPausedRef.current === newItem.paused

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
				lastSegmentPausedRef.current = newItem.paused

				const newSegment: Segment = {
					isPaused: newItem.paused,
					points: newSegmentStartPoints,
					color: newItem.paused ? pausedLineColor : activeLineColor
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
						type: !newItem.paused ? 'resume' : 'pause',
						position: newPoint,
						id: `trans-${Date.now()}`
					}
				])
			}
		},
		[segments]
	)

	useImperativeHandle(ref, () => ({
		setMapCenter: (center, durationInSeconds, zoom, animationType) =>
			changeMapCenter(center, durationInSeconds, zoom, animationType),
		fitAllMarkers: (durationInSeconds) => fitAllMarkers(durationInSeconds),
		updatePath: (newItem) => updatePath(newItem)
	}))

	const fitAllMarkers = (durationInSeconds?: number) => {
		if (!mapRef.current) return
		mapRef.current.fitAllMarkers(durationInSeconds, Animation.LINEAR)
	}

	const fitInitialRoute = (durationInSeconds?: number) => {
		if (!mapRef.current) return

		if (initialRoutePoints.length > 1) {
			mapRef.current.fitMarkers(initialRoutePoints, durationInSeconds, Animation.LINEAR)
			return
		}

		if (initialRoutePoints.length === 1) {
			mapRef.current.setCenter(
				initialRoutePoints[0],
				mapInitialRegionSettingsRef.zoom,
				undefined,
				undefined,
				durationInSeconds ?? 0,
				Animation.LINEAR
			)
			return
		}

		fitAllMarkers(durationInSeconds)
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

	const updateMapSettingsDebounced = debounce(updateYaMapSettings, 300)

	useEffect(() => {
		return () => {
			if (animationBlockTimerRef.current) {
				clearTimeout(animationBlockTimerRef.current)
			}
		}
	}, [])

	const lastPoint: Point | null = (() => {
		if (currentSegmentPointsRef.current.length > 0) {
			return currentSegmentPointsRef.current[currentSegmentPointsRef.current.length - 1]
		}

		// fallback: из segments (например при initial load)
		if (segments.length > 0) {
			const lastSegment = segments[segments.length - 1]
			if (lastSegment.points.length > 0) {
				return lastSegment.points[lastSegment.points.length - 1]
			}
		}

		return null
	})()

	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className="border-[1px] border-white/20"
			style={{
				overflow: 'hidden',
				borderRadius: props.rounded || 0,
				width: '100%',
				height: '100%',
				minHeight: props.minMapHeight,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<Yamap
				ref={mapRef}
				nightMode
				initialRegion={mapInitialRegionSettingsRef}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={props.logoPosition || { horizontal: 'right', vertical: 'top' }}
				logoPadding={props.logoPadding}
				showUserPosition={false}
				interactiveDisabled={props.interactiveDisabled}
				tiltGesturesDisabled={true}
				rotateGesturesDisabled={false}
				onCameraPositionChange={(e) => {
					if (['GESTURES', 'UNKNOWN'].includes(e.nativeEvent.reason)) {
						handleBlockAnimation()
					}
				}}
				onCameraPositionChangeEnd={() => {
					if (!props.needSaveCenter) return
					mapRef.current?.getCameraPosition((pos) => {
						updateMapSettingsDebounced({
							lat: pos.point.lat,
							lon: pos.point.lon,
							zoom: pos.zoom,
							azimuth: pos.azimuth
						})
					})
				}}
				onMapLoaded={() => {
					fitInitialRoute(0)
				}}
			>
				{props.initialMarkerLocation && (
					<YaMapUserLocationMarker
						ref={props.userLocationMarkerRef}
						initialPosition={props.initialMarkerLocation}
					/>
				)}

				{props.initialLocations?.current && props.initialLocations?.current.length >= 1 && (
					<YaMapStartLocationMarker
						position={{
							lat: props.initialLocations.current[0].locationObject.coords.latitude,
							lon: props.initialLocations.current[0].locationObject.coords.longitude
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
						<YaMapPauseLocationMarker key={tm.id} position={tm.position} />
					) : (
						<YaMapResumeLocationMarker key={tm.id} position={tm.position} />
					)
				)}

				{props.needFinishMarker && lastPoint && <YaMapFinishLocationMarker position={lastPoint} />}
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
		prev.deferInitialRouteRender === next.deferInitialRouteRender &&
		prev.initialMarkerLocation === next.initialMarkerLocation &&
		prev.userLocationMarkerRef === next.userLocationMarkerRef &&
		prev.initialLocations === next.initialLocations
	)
})
