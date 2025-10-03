import { MarkerRef, Polyline, Yamap } from 'react-native-yamap-plus-lite'
import UserLocationMarker from '@/components/ui/UserLocationMarker'
import { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationObject } from 'expo-location'
import { View } from 'react-native'
import { Button } from '@/components/ui/Button'

enum LOCATION_TYPE {
	BACKGROUND = 'background',
	FOREGROUND = 'foreground'
}

interface myLocationObj extends LocationObject {
	type: LOCATION_TYPE
}

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error)
		return
	}

	if (data) {
		const { locations } = data as { locations: LocationObject[] }
		const savedLocations = await AsyncStorage.getItem('@liveLocations')

		console.log('Received background locations', locations)

		const mappedLocations = locations.map((location) => ({ ...location, type: LOCATION_TYPE.BACKGROUND }))
		if (savedLocations) {
			const parsedSavedLocations = JSON.parse(savedLocations)
			console.log('locations to save', [...parsedSavedLocations, ...mappedLocations])
			await AsyncStorage.setItem('@liveLocations', JSON.stringify([...parsedSavedLocations, ...mappedLocations]))
		}
	}
})

const MapComponent = (props: { maxMapHeight?: number; minMapHeight?: number; rounded?: number }) => {
	const [liveLocations, setLiveLocations] = useState<myLocationObj[] | []>([])
	const [errorMsg, setErrorMsg] = useState<string | null>(null)

	const requestPermissions = async (): Promise<Location.PermissionStatus> => {
		const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()
		console.log('Foreground status:', foregroundStatus)

		if (foregroundStatus !== 'granted') {
			return foregroundStatus
		} else {
			const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()
			console.log('Background status:', backgroundStatus)

			return backgroundStatus
		}
	}

	const loadSavedLocations = async () => {
		try {
			const savedLocations = await AsyncStorage.getItem('@liveLocations')
			if (savedLocations) {
				setLiveLocations(JSON.parse(savedLocations))
			}
		} catch (e) {
			console.error('Failed to load saved locations', e)
		}
	}

	const saveLocations = async (locations: LocationObject[]) => {
		try {
			await AsyncStorage.setItem('@liveLocations', JSON.stringify(locations))
		} catch (e) {
			console.error('Failed to save locations', e)
		}
	}

	useEffect(() => {
		loadSavedLocations()

		let subscription: Location.LocationSubscription

		const startTracking = async () => {
			const status = await requestPermissions()

			console.log('75 status')
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied')
				console.log(errorMsg)
				return
			}

			const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)

			console.log('isTaskRegistered:', isTaskRegistered)
			if (!isTaskRegistered) {
				await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
					accuracy: Location.Accuracy.Balanced,
					distanceInterval: 1,
					foregroundService: {
						notificationTitle: 'Отслеживание местоположения',
						notificationBody: 'Приложение собирает данные о вашем местоположении',
						notificationColor: 'rgba(0,0,0,0)',
						killServiceOnDestroy: false
					},
					showsBackgroundLocationIndicator: true,
					deferredUpdatesDistance: 1
				})
			}

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Highest,
					distanceInterval: 1
				},
				(location) => {
					setLiveLocations((prev) => {
						const newLocations = [...prev, { ...location, type: LOCATION_TYPE.FOREGROUND }]
						saveLocations(newLocations)
						return newLocations
					})
				}
			)
		}

		startTracking()

		return () => {
			if (subscription) {
				subscription.remove()
			}
		}
	}, [])

	const lastLocation = liveLocations.at(-1)?.coords

	const foregroundLocations = liveLocations.filter((location) => location.type === LOCATION_TYPE.FOREGROUND)
	const backgroundLocations = liveLocations.filter((location) => location.type === LOCATION_TYPE.BACKGROUND)

	// const clearLocations = async () => {
	// 	setLiveLocations([])
	// 	await AsyncStorage.removeItem('@liveLocations')
	// }

	const userMarkerRef = useRef<MarkerRef | null>(null)

	const [accuracy, setAccuracy] = useState(5)
	const [markerPosition, setMarkerPosition] = useState({ lat: 53.422506, lon: 49.4781051 })
	const [circlePosition, setCirclePosition] = useState({ lat: 53.422506, lon: 49.4781051 })
	const [isAnimating, setIsAnimating] = useState(false)

	const animateToPosition = (targetPosition: { lat: number; lon: number }, duration: number = 500) => {
		if (isAnimating) return

		setIsAnimating(true)
		const startPosition = markerPosition
		const startTime = Date.now()

		const animateFrame = () => {
			const currentTime = Date.now()
			const progress = Math.min((currentTime - startTime) / duration, 1)

			// Эффект easing для более плавной анимации
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)

			const newLat = startPosition.lat + (targetPosition.lat - startPosition.lat) * easeOutQuart
			const newLon = startPosition.lon + (targetPosition.lon - startPosition.lon) * easeOutQuart

			const newPosition = { lat: newLat, lon: newLon }

			// Обновляем обе позиции синхронно
			setMarkerPosition(newPosition)
			setCirclePosition(newPosition)

			if (progress < 1) {
				requestAnimationFrame(animateFrame)
			} else {
				setIsAnimating(false)
			}
		}

		requestAnimationFrame(animateFrame)
	}

	const onClickMove = () => {
		animateToPosition({ lat: 53.4229, lon: 49.4782 }, 500)
	}

	const onClickAccuracy = () => {
		setAccuracy(15)
	}

	return (
		<View className="flex-1" style={{ overflow: 'hidden', borderRadius: props.rounded || 0 }}>
			<View>
				<Button variant="white" onPress={onClickMove}>
					передвинуть
				</Button>
				<Button variant="white" onPress={onClickAccuracy}>
					onClickAccuracy
				</Button>
			</View>
			<Yamap
				nightMode
				initialRegion={{ lat: 53.422506, lon: 49.4781051, zoom: 12 }}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				followUser
				showUserPosition={false}
				tiltGesturesEnabled={false}
			>
				{/*{lastLocation?.latitude && lastLocation?.longitude && (*/}
				{/*	<UserLocationMarker*/}
				{/*		position={{ lat: lastLocation?.latitude, lon: lastLocation?.longitude }}*/}
				{/*		accuracy={5}*/}
				{/*	/>*/}
				{/*)}*/}

				{/*{liveLocations?.length &&*/}
				{/*	liveLocations.map((location, idx) => (*/}
				{/*		<DefaultMarker*/}
				{/*			key={JSON.stringify(`${location}${idx}`)}*/}
				{/*			lat={location.coords.latitude}*/}
				{/*			lon={location.coords.longitude}*/}
				{/*		/>*/}
				{/*	))}*/}

				<UserLocationMarker userMarkerRef={userMarkerRef} position={markerPosition} accuracy={accuracy} />

				{foregroundLocations?.length && (
					<Polyline
						points={foregroundLocations.map((location) => ({
							lat: location.coords.latitude,
							lon: location.coords.longitude
						}))}
						strokeWidth={4}
						strokeColor={'black'}
						outlineColor={'black'}
						outlineWidth={2}
						handled={false}
						gapLength={5}
						dashLength={0}
						onPress={() => console.log('polyline press')}
					/>
				)}

				{backgroundLocations?.length && (
					<Polyline
						points={backgroundLocations.map((location) => ({
							lat: location.coords.latitude,
							lon: location.coords.longitude
						}))}
						strokeWidth={4}
						strokeColor={'blue'}
						outlineColor={'blue'}
						outlineWidth={2}
						handled={false}
						gapLength={5}
						dashLength={0}
					/>
				)}
			</Yamap>
		</View>
	)
}

export default MapComponent
