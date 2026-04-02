import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { View } from 'react-native'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { Colors } from '@/constants/Colors'
import { debounce } from '@/helpers/debounce'
import PauseLocationMarker from '@/components/map/markers/PauseLocationMarker'
import ResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker'
import StartLocationMarker from '@/components/map/markers/StartLocationMarker'
import FinishLocationMarker from '@/components/map/markers/FinishLocationMarker'
import { getMapSettings, updateMapSettings } from '@/store/mapStorage'
import { PolylineComponentInstanceRef, PolylineCustom } from '@/components/map/PolylineCustom'
import { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'
import UserLocationMarker, {
	UserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/UserLocationMarker'

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
	initialMarkerLocation?: Point | null
	userLocationMarkerRef?: React.RefObject<UserLocationMarkerHandle | null>
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
	const isAnimationBlockedRef = useRef<boolean>(false)
	const animationBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(getMapSettings()).current

	const activeLineColor = Colors['green-main']
	const pausedLineColor = Colors['gray-ab']

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
	}, [props.initialLocations?.current])

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
					points: currentGroup.map((l) => ({
						lat: l.locationObject.coords.latitude,
						lon: l.locationObject.coords.longitude
					})),
					color: prev.paused ? pausedLineColor : activeLineColor
				})

				markers.push({
					type: prev.paused ? 'resume' : 'pause',
					position: { lat: curr.locationObject.coords.latitude, lon: curr.locationObject.coords.longitude },
					id: `marker-${i}`
				})

				currentGroup = [curr]
			}
		}

		// Add the final group
		if (currentGroup.length > 0) {
			resultSegments.push({
				isPaused: currentGroup[0].paused,
				points: currentGroup.map((l) => ({
					lat: l.locationObject.coords.latitude,
					lon: l.locationObject.coords.longitude
				})),
				color: currentGroup[0].paused ? pausedLineColor : activeLineColor
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
		[segments, activeLineColor, pausedLineColor]
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
			className="flex-1 border-[1px] border-white/20"
			style={{
				overflow: 'hidden',
				borderRadius: props.rounded || 0,
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
					fitAllMarkers(0)
				}}
			>
				{/*<DirectionMarkersDebug center={{ lat: 53.374451, lon: 49.460469 }} />*/}
				{props.initialMarkerLocation && (
					<UserLocationMarker
						ref={props.userLocationMarkerRef}
						initialPosition={props.initialMarkerLocation}
					/>
				)}

				{props.initialLocations?.current && props.initialLocations?.current.length >= 1 && (
					<StartLocationMarker
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
						<PauseLocationMarker key={tm.id} position={tm.position} />
					) : (
						<ResumeLocationMarker key={tm.id} position={tm.position} />
					)
				)}

				{props.needFinishMarker && lastPoint && <FinishLocationMarker position={lastPoint} />}
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
