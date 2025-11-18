import { Animation, InitialRegion, Yamap, YamapRef } from 'react-native-yamap-plus'
import React, { forwardRef, JSX, useCallback, useImperativeHandle, useRef } from 'react'
import { View } from 'react-native'
import { IWorkoutLocationStorageItem, removeAllWorkoutStorage } from '@/store/workoutStorage'
import { Colors } from '@/constants/Colors'
import { Button } from '@/components/ui/Button'
import { debounce } from '@/helpers/debounce'
import UserLocationMarker, { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker'
import PauseLocationMarker from '@/components/map/markers/PauseLocationMarker'
import ResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker'
import StartLocationMarker from '@/components/map/markers/StartLocationMarker'
import { getMapSettings, updateMapSettings } from '@/store/mapStorage'
import { PolylineComponentInstanceRef, PolylineCustom } from '@/components/map/PolylineCustom'

export interface ILatLng {
	lat: number
	lon: number
}

interface IProps {
	maxMapHeight?: number
	minMapHeight?: number
	rounded?: number
	initialMarkerLocation?: ILatLng | null // @TODO заменить везде на Point из ya-map?
	userLocationMarkerRef?: React.RefObject<UserLocationMarkerHandle | null>
	userLocations?: IWorkoutLocationStorageItem[]
}

export interface MapComponentHandle {
	setMapCenter: (center: ILatLng | null, durationInSeconds?: number, zoom?: number, animationType?: Animation) => void
	fitAllMarkers: (durationInSeconds?: number) => void
}

const MapComponent = forwardRef<MapComponentHandle, IProps>((props, ref) => {
	const mapRef = useRef<YamapRef>(null)
	const polylineRef = useRef<PolylineComponentInstanceRef[]>([])
	const isAnimationBlocked = useRef<boolean>(false)
	const animationBlockTimer = useRef<NodeJS.Timeout | null>(null)
	const mapInitialRegionSettings = useRef<InitialRegion>(getMapSettings()).current

	useImperativeHandle(ref, () => ({
		setMapCenter: (center, durationInSeconds, zoom, animationType) =>
			changeMapCenter(center, durationInSeconds, zoom, animationType),
		fitAllMarkers: (durationInSeconds) => fitAllMarkers(durationInSeconds)
	}))

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

			elements.push(
				<PolylineCustom
					ref={(elem) => {
						if (elem) {
							polylineRef.current.push(elem)
						}
					}}
					key={`group-${idx}`}
					points={points}
					strokeColor={color}
					strokeWidth={4}
				/>
			)

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
		console.log('changeMapCenter', isAnimationBlocked.current)
		if (isAnimationBlocked.current) return
		if (!center) return
		if (!mapRef.current) return
		mapRef.current.getCameraPosition((cameraPosition) => {
			if (!mapRef.current) return
			mapRef.current.setCenter(
				center,
				zoom ?? cameraPosition.zoom,
				cameraPosition.azimuth,
				cameraPosition.tilt,
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
		<View className="flex-1" style={{ overflow: 'hidden', borderRadius: props.rounded || 0 }}>
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
							azimuth: pos.azimuth,
							tilt: pos.tilt
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

				{props.userLocations && props.userLocations?.length >= 2 && (
					<StartLocationMarker
						position={{
							lat: props.userLocations[0].locationObject.coords.latitude,
							lon: props.userLocations[0].locationObject.coords.longitude
						}}
					/>
				)}

				{/*<PauseLocationMarker position={{ lat: 53.374451, lon: 49.460469 }} />*/}
				{/*<ResumeLocationMarker position={{ lat: 53.374451, lon: 49.460489 }} />*/}
				{/*<FinishLocationMarker position={{ lat: 53.374451, lon: 49.660469 }} />*/}

				{renderLines(props.userLocations)}
			</Yamap>
		</View>
	)
})

MapComponent.displayName = 'MapComponent'

export default React.memo(
	MapComponent,
	(prev, next) =>
		prev.initialMarkerLocation?.lat === next.initialMarkerLocation?.lat &&
		prev.initialMarkerLocation?.lon === next.initialMarkerLocation?.lon &&
		prev.maxMapHeight === next.maxMapHeight &&
		prev.minMapHeight === next.minMapHeight &&
		prev.rounded === next.rounded &&
		prev.userLocations === next.userLocations
)
