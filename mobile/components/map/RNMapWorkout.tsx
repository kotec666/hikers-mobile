import { View } from 'react-native'
import MapView, { Polyline, Camera, EdgePadding } from 'react-native-maps'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import RNMapsStartLocationMarker from '@/components/map/markers/StartLocationMarker/RNMapsStartLocationMarker'
import RNMapsPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/RNMapsPauseLocationMarker'
import RNMapsResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/RNMapsResumeLocationMarker'
import RNMapsFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/RNMapsFinishLocationMarker'
import { getRNMapSettings, updateRNMapSettings } from '@/store/rnMapStorage'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { useWorkoutPath } from '@/hooks/useWorkoutPath'
import { debounce } from '@/helpers/debounce'
import { IPoint } from '@/types/interfaces'
import RNMapsUserLocationMarker, {
	RNMapsUserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import { DEFAULT_APPLE_LEGAL_POSITION, DEFAULT_APPLE_LOGO_POSITION } from '@/constants/RNMap'
import RNSegmentPolyline from '@/components/map/polyline/RNSegmentPolyline'
import { cn } from '@/helpers/cn'
import { useAuthStore } from '@/store/authStore'

export enum RNMapAnimationType {
	SMOOTH = 'smooth',
	LINEAR = 'linear'
}

type PolylineRef = React.ComponentRef<typeof Polyline>

export interface RNMapWorkoutHandle {
	setMapCenter: (newCenter: {
		center: IPoint | null
		zoomInMeters?: number
		animationType?: RNMapAnimationType
	}) => void
	updatePath: (newItem: IWorkoutLocationStorageItem[]) => void
}

export interface IRNMapWorkoutProps {
	rounded?: number
	bordered?: boolean
	needSaveCenter?: boolean
	needFinishMarker?: boolean
	needFitInitialRoute?: boolean
	interactiveDisabled?: boolean
	maxContainerHeight?: number
	appleLogoPosition?: EdgePadding
	appleLegalPosition?: EdgePadding
	initialMarkerLocation?: IPoint | null
	initialLocations?: IWorkoutLocationStorageItem[]
	userLocationMarkerRef?: React.RefObject<RNMapsUserLocationMarkerHandle | null>
	latestUserMarkerLocationRef?: React.RefObject<IPoint | null> | undefined
}

const RNMapWorkout = forwardRef<RNMapWorkoutHandle, IRNMapWorkoutProps>((props, ref) => {
	const { user } = useAuthStore()
	const mapRef = useRef<MapView | null>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const mapInitialCameraSettingsRef = useRef<Camera>(getRNMapSettings())
	const updateMapSettingsDebounced = useMemo(() => debounce(updateRNMapSettings, 300), [])

	const handleBlockAnimation = useCallback((needBlock: boolean) => {
		isAnimationBlockedRef.current = needBlock
	}, [])

	const { segmentsRef, transitionMarkersRef, updatePath, initPath } = useWorkoutPath<PolylineRef>({
		createPolylineRef: () => React.createRef<PolylineRef>(),
		onNativeUpdate: (segment, points) => {
			segment.polylineRef.current?.setNativeProps({
				coordinates: points.map((p) => ({
					latitude: p.lat,
					longitude: p.lon
				}))
			})
		}
	})

	const changeMapCenter = async (
		center: IPoint | null,
		zoomInMeters?: number,
		animationType: RNMapAnimationType = RNMapAnimationType.SMOOTH
	) => {
		if (isAnimationBlockedRef.current) return
		if (!center) return
		if (!mapRef.current) return

		const cameraPosition = await mapRef.current.getCamera()
		const newCameraPosition = {
			...cameraPosition,
			altitude: zoomInMeters, //  ?? 500 аналог zoom (в метрах)
			center: { latitude: center.lat, longitude: center.lon }
		}
		if (animationType === RNMapAnimationType.SMOOTH) {
			return mapRef.current.animateCamera(newCameraPosition)
		} else {
			return mapRef.current.setCamera(newCameraPosition)
		}
	}

	useImperativeHandle(ref, () => ({
		setMapCenter: (newCenter) => changeMapCenter(newCenter.center, newCenter.zoomInMeters, newCenter.animationType),
		updatePath: (newItems) => updatePath(newItems)
	}))

	const fitInitialRoute = () => {
		if (!mapRef.current) return
		const initialLocations = props.initialLocations
		if (!initialLocations || initialLocations.length === 0) return
		const edgePaddingValue = 60
		mapRef.current.fitToCoordinates(
			initialLocations.map((loc) => ({
				latitude: loc.locationObject.coords.latitude,
				longitude: loc.locationObject.coords.longitude
			})),
			{
				edgePadding: {
					top: edgePaddingValue,
					left: edgePaddingValue,
					right: edgePaddingValue,
					bottom: edgePaddingValue
				},
				animated: false
			}
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
			<MapView
				ref={mapRef}
				userInterfaceStyle="dark"
				style={{ height: '100%', width: '100%' }} // style={{ flex: 1 }}
				scrollEnabled={!props.interactiveDisabled}
				zoomEnabled={!props.interactiveDisabled}
				rotateEnabled={!props.interactiveDisabled}
				pitchEnabled={!props.interactiveDisabled}
				onRegionChangeStart={() => handleBlockAnimation(true)}
				onRegionChangeComplete={() => {
					handleBlockAnimation(false)

					if (!props.needSaveCenter) return
					const currentMap = mapRef.current
					if (!currentMap) return

					currentMap
						.getCamera()
						.then((newCameraPosition) => {
							updateMapSettingsDebounced(newCameraPosition)
							mapInitialCameraSettingsRef.current = {
								...mapInitialCameraSettingsRef.current,
								...newCameraPosition
							}
						})
						.catch(() => {})
				}}
				onMapReady={() => {
					if (!props.needFitInitialRoute) return
					const initialLocations = props.initialLocations
					if (initialLocations?.length) {
						initPath(initialLocations)
					}

					fitInitialRoute()
				}}
				showsScale
				showsCompass={false}
				initialCamera={mapInitialCameraSettingsRef.current}
				appleLogoInsets={props.appleLogoPosition || DEFAULT_APPLE_LOGO_POSITION}
				legalLabelInsets={props.appleLegalPosition || DEFAULT_APPLE_LEGAL_POSITION}
			>
				<RNMapsUserLocationMarker
					ref={props.userLocationMarkerRef}
					initialPosition={markerPosition}
					color={user?.color}
				/>

				{startPosition && <RNMapsStartLocationMarker position={startPosition} color={user?.color} />}

				{segmentsRef.current.map((seg, idx) => (
					<RNSegmentPolyline key={idx} polylineRef={seg.polylineRef} color={seg.color} points={seg.points} />
				))}

				{transitionMarkersRef.current.map((tm) =>
					tm.type === 'pause' ? (
						<RNMapsPauseLocationMarker key={tm.id} position={tm.position} color={user?.color} />
					) : (
						<RNMapsResumeLocationMarker key={tm.id} position={tm.position} color={user?.color} />
					)
				)}

				{props.needFinishMarker && <RNMapsFinishLocationMarker position={finishPosition} color={user?.color} />}
			</MapView>
		</View>
	)
})

RNMapWorkout.displayName = 'RNMapWorkout'

const isPointEqual = (a?: IPoint | null, b?: IPoint | null) => {
	if (a === b) return true
	if (!a || !b) return false

	return a.lat === b.lat && a.lon === b.lon
}

const isEdgePaddingEqual = (a?: EdgePadding, b?: EdgePadding) => {
	if (a === b) return true
	if (!a || !b) return false

	return a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left
}

export default React.memo(RNMapWorkout, (prev, next) => {
	const layoutPropsEqual =
		prev.rounded === next.rounded &&
		prev.bordered === next.bordered &&
		prev.needSaveCenter === next.needSaveCenter &&
		prev.needFinishMarker === next.needFinishMarker &&
		prev.needFitInitialRoute === next.needFitInitialRoute &&
		prev.interactiveDisabled === next.interactiveDisabled &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.userLocationMarkerRef === next.userLocationMarkerRef &&
		prev.latestUserMarkerLocationRef === next.latestUserMarkerLocationRef &&
		isPointEqual(prev.initialMarkerLocation, next.initialMarkerLocation) &&
		isEdgePaddingEqual(prev.appleLogoPosition, next.appleLogoPosition) &&
		isEdgePaddingEqual(prev.appleLegalPosition, next.appleLegalPosition)

	if (!layoutPropsEqual) {
		return false
	}

	if (prev.initialLocations === next.initialLocations) return true

	const prevLen = prev.initialLocations ? prev.initialLocations.length : 0
	const nextLen = next.initialLocations ? next.initialLocations.length : 0

	return prevLen === nextLen
})
