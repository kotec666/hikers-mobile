import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Polyline, Yamap } from 'react-native-yamap-plus-lite';
import UserLocationMarker from '@/components/ui/UserLocationMarker';
import DefaultMarker from '@/components/ui/DefaultMarker';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

enum LOCATION_TYPE {
	BACKGROUND = 'background',
	FOREGROUND = 'foreground',
}

interface myLocationObj extends Location.LocationObject {
	type: LOCATION_TYPE;
}

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error);
		return;
	}

	if (data) {
		const { locations } = data as { locations: Location.LocationObject[] };
		const savedLocations = await AsyncStorage.getItem('@liveLocations');

		console.log('Received background locations', locations);

		const mappedLocations = locations.map((location) => ({ ...location, type: LOCATION_TYPE.BACKGROUND }));
		if (savedLocations) {
			const parsedSavedLocations = JSON.parse(savedLocations);
			console.log('locations to save', [...parsedSavedLocations, ...mappedLocations]);
			await AsyncStorage.setItem('@liveLocations', JSON.stringify([...parsedSavedLocations, ...mappedLocations]));
		}
	}
});

export default function Map() {
	const [liveLocations, setLiveLocations] = useState<myLocationObj[] | []>([]);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const requestPermissions = async (): Promise<Location.PermissionStatus> => {
		const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
		console.log('Foreground status:', foregroundStatus);

		if (foregroundStatus !== 'granted') {
			return foregroundStatus;
		} else {
			const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
			console.log('Background status:', backgroundStatus);

			return backgroundStatus;
		}
	};

	const loadSavedLocations = async () => {
		try {
			const savedLocations = await AsyncStorage.getItem('@liveLocations');
			if (savedLocations) {
				setLiveLocations(JSON.parse(savedLocations));
			}
		} catch (e) {
			console.error('Failed to load saved locations', e);
		}
	};

	const saveLocations = async (locations: Location.LocationObject[]) => {
		try {
			await AsyncStorage.setItem('@liveLocations', JSON.stringify(locations));
		} catch (e) {
			console.error('Failed to save locations', e);
		}
	};

	useEffect(() => {
		loadSavedLocations();

		let subscription: Location.LocationSubscription;

		const startTracking = async () => {
			const status = await requestPermissions();

			console.log('75 status');
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

			console.log('isTaskRegistered:', isTaskRegistered);
			if (!isTaskRegistered) {
				await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
					accuracy: Location.Accuracy.Balanced,
					distanceInterval: 1,
					foregroundService: {
						notificationTitle: 'Отслеживание местоположения',
						notificationBody: 'Приложение собирает данные о вашем местоположении',
						notificationColor: 'rgba(0,0,0,0)',
						killServiceOnDestroy: false,
					},
					showsBackgroundLocationIndicator: true,
					deferredUpdatesDistance: 1,
				});
			}

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Highest,
					distanceInterval: 1,
				},
				(location) => {
					setLiveLocations((prev) => {
						const newLocations = [...prev, { ...location, type: LOCATION_TYPE.FOREGROUND }];
						saveLocations(newLocations);
						return newLocations;
					});
				},
			);
		};

		startTracking();

		return () => {
			if (subscription) {
				subscription.remove();
			}
		};
	}, []);

	const lastLocation = liveLocations.at(-1)?.coords;

	const clearLocations = async () => {
		setLiveLocations([]);
		await AsyncStorage.removeItem('@liveLocations');
	};

	const foregroundLocations = liveLocations.filter((location) => location.type === LOCATION_TYPE.FOREGROUND);
	const backgroundLocations = liveLocations.filter((location) => location.type === LOCATION_TYPE.BACKGROUND);

	{
		/*<Text>{JSON.stringify(foregroundLocations, null, 2)}</Text>*/
	}
	{
		/*<Text>{JSON.stringify(backgroundLocations, null, 2)}</Text>*/
	}
	{
		/*<Text>{JSON.stringify(foregroundLocations.map(location => ({ lat: location.coords.latitude, lon: location.coords.longitude })), null, 2)}</Text>*/
	}
	{
		/*<Text>{JSON.stringify(backgroundLocations.map(location => ({ lat: location.coords.latitude, lon: location.coords.longitude })), null, 2)}</Text>*/
	}
	return (
		<View style={styles.container}>
			<Yamap
				initialRegion={{ lat: 53.422506, lon: 49.4781051, zoom: 12 }}
				style={styles.map}
				logoPosition={{ horizontal: 'right', vertical: 'bottom' }}
				followUser
				showUserPosition={false}
			>
				{lastLocation?.latitude && lastLocation?.longitude && (
					<UserLocationMarker
						position={{ lat: lastLocation?.latitude, lon: lastLocation?.longitude }}
						heading={lastLocation?.heading}
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

				{foregroundLocations?.length && (
					<Polyline
						points={foregroundLocations.map((location) => ({
							lat: location.coords.latitude,
							lon: location.coords.longitude,
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
							lon: location.coords.longitude,
						}))}
						strokeWidth={4}
						strokeColor={'blue'}
						outlineColor={'blue'}
						outlineWidth={2}
						handled={false}
						gapLength={5}
						dashLength={0}
						onPress={() => console.log('polyline press')}
					/>
				)}
			</Yamap>

			<Pressable onPress={clearLocations} style={styles.button}>
				<Text style={styles.buttonText}>Очистить live locations</Text>
			</Pressable>
			<Pressable onPress={requestPermissions} style={styles.buttonPerms}>
				<Text style={styles.buttonText}>request Permissions</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
	},
	map: {
		flex: 1,
	},
	button: {
		position: 'absolute',
		top: 50,
		left: 20,
		right: 20,
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		zIndex: 1000,
	},
	buttonPerms: {
		position: 'absolute',
		top: 105,
		left: 20,
		right: 20,
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		zIndex: 1000,
	},
	buttonNotificationsPerms: {
		position: 'absolute',
		top: 160,
		left: 20,
		right: 20,
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		zIndex: 1000,
	},
	buttonText: {
		color: 'black',
		fontWeight: 'bold',
	},
});
