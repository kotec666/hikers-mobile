import { Polyline, Yamap } from 'react-native-yamap-plus-lite'
import UserLocationMarker from '@/components/ui/UserLocationMarker'
import DefaultMarker from '@/components/ui/DefaultMarker'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationObject } from 'expo-location'

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

const MapComponent = () => {
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

	return (
		<Yamap
			nightMode
			initialRegion={{ lat: 53.422506, lon: 49.4781051, zoom: 12 }}
			style={{ flex: 1 }}
			logoPosition={{ horizontal: 'right', vertical: 'top' }}
			followUser
			showUserPosition={false}
		>
			{lastLocation?.latitude && lastLocation?.longitude && (
				<UserLocationMarker
					position={{ lat: lastLocation?.latitude, lon: lastLocation?.longitude }}
					accuracy={5}
				/>
			)}

			{liveLocations?.length &&
				liveLocations.map((location, idx) => (
					<DefaultMarker
						key={JSON.stringify(`${location}${idx}`)}
						lat={location.coords.latitude}
						lon={location.coords.longitude}
					/>
				))}

			<UserLocationMarker position={{ lat: 53.422506, lon: 49.4781051 }} />

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
	)
}

export default MapComponent
