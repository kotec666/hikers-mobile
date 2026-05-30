import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { debounce } from '@/helpers/debounce'
import YaMapPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/YaMapPauseLocationMarker'
import YaMapResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/YaMapResumeLocationMarker'
import YaMapStartLocationMarker from '@/components/map/markers/StartLocationMarker/YaMapStartLocationMarker'
import { getYaMapSettings, updateYaMapSettings } from '@/store/yaMapStorage'
import { PolylineComponentInstanceRef, PolylineCustom } from '@/components/map/PolylineCustom'
import YaMapUserLocationMarker, {
	YaMapUserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { useWorkoutPath } from '@/hooks/useWorkoutPath'

interface IProps {
	rounded?: number
	maxContainerHeight?: number
	initialMarkerLocation?: Point | null
	userLocationMarkerRef?: React.RefObject<YaMapUserLocationMarkerHandle | null>
	latestUserMarkerLocationRef?: React.RefObject<Point | null> | undefined
	initialLocations?: IWorkoutLocationStorageItem[]
}

export interface YaMapWorkoutHandle {
	setMapCenter: (center: Point | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
	fitAllMarkers: (durationInSeconds?: number) => void
	updatePath: (newItem: IWorkoutLocationStorageItem[]) => void
}

const YaMapWorkout = forwardRef<YaMapWorkoutHandle, IProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(getYaMapSettings())

	const { segmentsRef, transitionMarkersRef, updatePath } = useWorkoutPath<PolylineComponentInstanceRef>({
		createPolylineRef: () => React.createRef<PolylineComponentInstanceRef>(),
		onNativeUpdate: (segment, points) => {
			segment.polylineRef.current?.setNativeProps({
				points
			})
		}
	})

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

	const handleBlockAnimation = useCallback((needBlock: boolean) => {
		isAnimationBlockedRef.current = needBlock
	}, [])

	const updateMapSettingsDebounced = useMemo(() => debounce(updateYaMapSettings, 300), [])

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

	const markerPosition = props.latestUserMarkerLocationRef?.current || props.initialMarkerLocation

	return (
		<View
			style={{
				flex: 1,
				overflow: 'hidden',
				borderRadius: props.rounded || 0,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<Yamap
				ref={mapRef}
				nightMode
				initialRegion={mapInitialRegionSettingsRef.current}
				style={StyleSheet.absoluteFill}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				showUserPosition={false}
				tiltGesturesDisabled={true}
				rotateGesturesDisabled={false}
				onCameraPositionChange={() => {
					if (isAnimationBlockedRef.current) return
					handleBlockAnimation(true)
					// if (['GESTURES', 'UNKNOWN'].includes(e.nativeEvent.reason)) {
					// 	handleBlockAnimation()
					// }
				}}
				onCameraPositionChangeEnd={() => {
					handleBlockAnimation(false)
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
				<YaMapUserLocationMarker ref={props.userLocationMarkerRef} initialPosition={markerPosition} />

				{startPosition && <YaMapStartLocationMarker position={startPosition} />}

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
						<YaMapPauseLocationMarker key={tm.id} position={tm.position} />
					) : (
						<YaMapResumeLocationMarker key={tm.id} position={tm.position} />
					)
				)}

				{/*<YaMapFinishLocationMarker position={{ lat: 53.374451, lon: 49.660469 }} />*/}
			</Yamap>
		</View>
	)
})

YaMapWorkout.displayName = 'YaMapWorkout'

export default React.memo(YaMapWorkout, (prev, next) => {
	const layoutPropsEqual =
		prev.maxContainerHeight === next.maxContainerHeight &&
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
