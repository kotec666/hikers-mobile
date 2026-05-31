import { Animation, InitialRegion, Point, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { View } from 'react-native'
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
import YaMapFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/YaMapFinishLocationMarker'
import { cn } from '@/helpers/cn'

export interface IYaMapWorkoutProps {
	rounded?: number
	bordered?: boolean
	needSaveCenter?: boolean
	needFinishMarker?: boolean
	needFitInitialRoute?: boolean
	interactiveDisabled?: boolean
	maxContainerHeight?: number
	initialMarkerLocation?: Point | null
	userLocationMarkerRef?: React.RefObject<YaMapUserLocationMarkerHandle | null>
	latestUserMarkerLocationRef?: React.RefObject<Point | null> | undefined
	initialLocations?: IWorkoutLocationStorageItem[]
	logoPosition?: {
		horizontal?: 'left' | 'center' | 'right'
		vertical?: 'top' | 'bottom'
	}
	logoPadding?: {
		horizontal?: number
		vertical?: number
	}
}

export interface YaMapWorkoutHandle {
	setMapCenter: (center: Point | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
	updatePath: (newItem: IWorkoutLocationStorageItem[]) => void
}

const YaMapWorkout = forwardRef<YaMapWorkoutHandle, IYaMapWorkoutProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const mapInitialRegionSettingsRef = useRef<InitialRegion>(getYaMapSettings())

	const { segmentsRef, transitionMarkersRef, updatePath, initPath } = useWorkoutPath<PolylineComponentInstanceRef>({
		createPolylineRef: () => React.createRef<PolylineComponentInstanceRef>(),
		onNativeUpdate: (segment, points) => {
			segment.polylineRef.current?.setNativeProps({
				points
			})
		}
	})

	useImperativeHandle(ref, () => ({
		setMapCenter: (center, durationInSeconds, zoom, animationType) =>
			changeMapCenter(center, durationInSeconds, zoom, animationType),
		updatePath: (newItems) => updatePath(newItems)
	}))

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

	const fitInitialRoute = () => {
		if (!mapRef.current) return
		const initialLocations = props.initialLocations
		if (!initialLocations || initialLocations.length === 0) return
		mapRef.current.fitMarkers(
			initialLocations.map((loc) => ({
				lat: loc.locationObject.coords.latitude,
				lon: loc.locationObject.coords.longitude
			})),
			0,
			Animation.LINEAR
		)
	}

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

	const finishPosition = useMemo(() => {
		const initialLocations = props.initialLocations
		if (!initialLocations) return null
		const lastLocation = initialLocations[initialLocations.length - 1]
		if (!lastLocation) return null
		return { lat: lastLocation.locationObject.coords.latitude, lon: lastLocation.locationObject.coords.longitude }
	}, [props.initialLocations])

	const markerPosition = props.latestUserMarkerLocationRef?.current || props.initialMarkerLocation

	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className={cn('overflow-hidden', {
				'border-[1px] border-white/20': props.bordered
			})}
			style={{
				width: '100%',
				height: '100%',
				borderRadius: props.rounded || 0,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<Yamap
				ref={mapRef}
				nightMode
				initialRegion={mapInitialRegionSettingsRef.current}
				style={{ height: '100%', width: '100%' }} // style={{ flex: 1 }}
				logoPosition={props.logoPosition || { horizontal: 'right', vertical: 'top' }}
				logoPadding={props.logoPadding}
				showUserPosition={false}
				tiltGesturesDisabled={true}
				rotateGesturesDisabled={false}
				interactiveDisabled={props.interactiveDisabled}
				onCameraPositionChange={() => {
					if (isAnimationBlockedRef.current) return
					handleBlockAnimation(true)
					// if (['GESTURES', 'UNKNOWN'].includes(e.nativeEvent.reason)) {
					// 	handleBlockAnimation()
					// }
				}}
				onCameraPositionChangeEnd={() => {
					handleBlockAnimation(false)
					if (!props.needSaveCenter) return
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
				onLayout={() => {
					if (!props.needFitInitialRoute) return
					const initialLocations = props.initialLocations
					if (initialLocations?.length) {
						initPath(initialLocations)
					}

					fitInitialRoute()
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

				{props.needFinishMarker && <YaMapFinishLocationMarker position={finishPosition} />}
			</Yamap>
		</View>
	)
})

YaMapWorkout.displayName = 'YaMapWorkout'

export default React.memo(YaMapWorkout, (prev, next) => {
	const layoutPropsEqual =
		prev.rounded === next.rounded &&
		prev.bordered === next.bordered &&
		prev.needSaveCenter === next.needSaveCenter &&
		prev.needFinishMarker === next.needFinishMarker &&
		prev.needFitInitialRoute === next.needFitInitialRoute &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.interactiveDisabled === next.interactiveDisabled &&
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
