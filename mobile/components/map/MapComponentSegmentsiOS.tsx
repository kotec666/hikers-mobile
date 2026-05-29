import React, { useRef } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import MapView, { Polyline, LatLng, Camera } from 'react-native-maps'
import RNMapsUserLocationMarker, {
	UserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import { Colors } from '@/constants/Colors'
import RNMapsFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/RNMapsFinishLocationMarker'
import RNMapsPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/RNMapsPauseLocationMarker'
import RNMapsResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/RNMapsResumeLocationMarker'
import RNMapsStartLocationMarker from '@/components/map/markers/StartLocationMarker/RNMapsStartLocationMarker'
import { getRNMapSettings, updateRNMapSettings } from '@/store/rnMapStorage'
import { debounce } from '@/helpers/debounce'

interface Point {
	lat: number
	lon: number
}

export enum MapAnimationType {
	SMOOTH = 'smooth',
	LINEAR = 'linear'
}

const activeLineColor = 'rgb(34, 203, 90)'
const pausedLineColor = Colors['gray-ab'] // 'rgba(34, 203, 90, 0.5)'

type PolylineRef = React.ComponentRef<typeof Polyline>
const MapComponentSegmentsiOS = () => {
	const mapRef = useRef<MapView | null>(null)
	const polylineRef = useRef<PolylineRef | null>(null)
	const userMarkerRef = useRef<UserLocationMarkerHandle | null>(null)
	const isAnimationBlockedRef = useRef<boolean>(false)
	const mapInitialCameraSettingsRef = useRef<Camera>(getRNMapSettings())

	const updateMapSettingsDebounced = debounce(updateRNMapSettings, 300)

	const handleBlockAnimation = (needBlock: boolean) => {
		isAnimationBlockedRef.current = needBlock
	}

	const changeMapCenter = async (
		center: Point | null,
		animationType: MapAnimationType = MapAnimationType.SMOOTH,
		zoomInMeters?: number
	) => {
		if (isAnimationBlockedRef.current) return
		if (!center) return
		if (!mapRef.current) return

		const cameraPosition = await mapRef.current.getCamera()
		const newCameraPosition = {
			...cameraPosition,
			altitude: zoomInMeters ?? 500, // аналог zoom (в метрах)
			center: { latitude: center.lat, longitude: center.lon }
		}
		if (animationType === MapAnimationType.SMOOTH) {
			return mapRef.current.animateCamera(newCameraPosition)
		} else {
			return mapRef.current.setCamera(newCameraPosition)
		}
	}

	const changePolylineProps = () => {
		polylineRef.current?.setNativeProps({
			coordinates: [
				{
					latitude: 55.958745,
					longitude: 37.819153
				},
				{
					latitude: 55.158745,
					longitude: 37.619153
				},
				{
					latitude: 55.158745,
					longitude: 38.619153
				},
				{
					latitude: 55.258745,
					longitude: 38.719153
				}
			],
			// strokeColor: '#fff',
			strokeColors: [activeLineColor, pausedLineColor, pausedLineColor, activeLineColor]
		})
	}

	const handleAnimateUserPositionMove = (position: LatLng) => {
		userMarkerRef.current?.setMarkerPosition({ lat: position.latitude, lon: position.longitude })
	}

	const handleSetHeadingUserMarker = (heading: number) => {
		userMarkerRef.current?.setMarkerHeading(heading)
	}

	function getRandomNumber(): number {
		return Math.floor(Math.random() * 361)
	}

	const handleSetRandomAccuracy = (accuracy: number) => {
		userMarkerRef.current?.setAccuracy(accuracy)
	}

	return (
		<View style={{ flex: 1 }}>
			<MapView
				ref={mapRef}
				style={StyleSheet.absoluteFill}
				userInterfaceStyle="dark"
				onRegionChangeStart={() => handleBlockAnimation(true)}
				onRegionChangeComplete={async () => {
					handleBlockAnimation(false)
					const newCameraPosition = await mapRef.current?.getCamera()
					updateMapSettingsDebounced(newCameraPosition)
					mapInitialCameraSettingsRef.current = {
						...mapInitialCameraSettingsRef.current,
						...newCameraPosition
					}
				}}
				showsCompass={false}
				showsScale
				initialCamera={mapInitialCameraSettingsRef.current}
				appleLogoInsets={{ top: 2, right: 48, bottom: 0, left: 0 }}
				legalLabelInsets={{ top: 17, right: 10, bottom: 0, left: 0 }}
			>
				<RNMapsUserLocationMarker
					ref={userMarkerRef}
					debugAccuracyM={50}
					initialPosition={{ lat: 55.758745, lon: 37.619153 }}
				/>
				<RNMapsStartLocationMarker
					position={{
						lat: 55.758845,
						lon: 37.619153
					}}
				/>
				<RNMapsPauseLocationMarker
					position={{
						lat: 55.758845,
						lon: 37.6192
					}}
				/>
				<RNMapsResumeLocationMarker
					position={{
						lat: 55.758845,
						lon: 37.61925
					}}
				/>
				<RNMapsFinishLocationMarker
					position={{
						lat: 55.758848,
						lon: 37.61934
					}}
				/>
				<Polyline
					ref={polylineRef}
					strokeWidth={4}
					strokeColors={[activeLineColor, activeLineColor]}
					coordinates={[
						{
							latitude: 55.758745,
							longitude: 37.619153
						},
						{
							latitude: 55.858745,
							longitude: 37.719153
						}
					]}
				/>
			</MapView>
			<Pressable
				onPress={() => changeMapCenter({ lat: 55.758745, lon: 37.619153 }, MapAnimationType.SMOOTH, 1000)}
			>
				<Text>changeMapCenter</Text>
			</Pressable>
			<Pressable onPress={() => changePolylineProps()}>
				<Text>changePolylineProps</Text>
			</Pressable>
			<Pressable
				onPress={() =>
					handleAnimateUserPositionMove({
						latitude: 55.75877, // Moscow
						longitude: 37.61918
					})
				}
			>
				<Text>handleAnimateUserPositionMove</Text>
			</Pressable>
			<Pressable
				onPress={() =>
					handleAnimateUserPositionMove({
						latitude: 55.758745,
						longitude: 37.619153
					})
				}
			>
				<Text>handleAnimateUserPositionMoveInitial</Text>
			</Pressable>
			<Pressable onPress={() => handleSetHeadingUserMarker(getRandomNumber())}>
				<Text>handleSetHeading marker</Text>
			</Pressable>
			<Pressable onPress={() => handleSetRandomAccuracy(getRandomNumber())}>
				<Text>handleSetRandomAccuracy</Text>
			</Pressable>
		</View>
	)
}

export default MapComponentSegmentsiOS
