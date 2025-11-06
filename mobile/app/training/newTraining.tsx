import { StyleSheet, SafeAreaView } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useEffect, useRef, useState } from 'react'
import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import * as Location from 'expo-location'
import { useToast } from '@/hooks/useToast'
import WorkoutStarted from '@/components/training/WorkoutStarted'
import NewWorkout, { IWorkoutModeElement } from '@/components/training/NewWorkout'
import { useWorkoutStore, WORKOUT_STAGE } from '@/store/workoutStore'
import { LocationObject } from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { getAllWorkoutStorage, setWorkoutItem } from '@/store/workoutStorage'
import { ILatLng } from '@/components/map/MapComponent'
import { getRandomNumber } from '@/helpers/getRandomNumber'

const WorkoutTypesData = [
	{ id: 1, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 2, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 3, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 4, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 5, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 6, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 7, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 8, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 9, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 10, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 11, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 12, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 13, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 14, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 15, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 16, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 17, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 18, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 19, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 20, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 21, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 22, name: 'Велосипед last', IconComponent: WorkoutBicycle }
]

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error)
		return
	}

	if (data) {
		const { locations } = data as { locations: LocationObject[] }
		console.log('Received background locations', locations)
		setWorkoutItem(locations)
	}
})

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { setWorkoutStage } = useWorkoutStore()
	const locationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const [markerPosition, setMarkerPosition] = useState<ILatLng | null>() // { lat: 53.422506, lon: 49.4781051 }
	const [accuracy, setAccuracy] = useState<number | null>(null)
	const [heading, setHeading] = useState(0)

	const [state, setState] = useState<{
		chosenWorkout: IWorkoutModeElement | null
		isWorkoutStarted: boolean
		retryPermissions: boolean // переключатель для триггера проверки разрешений
		isPaused: boolean
		myLocations: Location.LocationObject[] | null
	}>({
		chosenWorkout: WorkoutTypesData[0],
		isWorkoutStarted: false,
		retryPermissions: false,
		isPaused: false,
		myLocations: null
	})

	const startTracking = async () => {
		const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)

		console.log('isTaskRegistered:', isTaskRegistered)
		if (!isTaskRegistered) {
			await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
				accuracy: Location.Accuracy.BestForNavigation,
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

		locationSubscriptionRef.current = await Location.watchPositionAsync(
			{
				accuracy: Location.Accuracy.BestForNavigation,
				distanceInterval: 1
			},
			(location) => {
				setMarkerPosition({ lat: location.coords.latitude, lon: location.coords.longitude })
				setHeading(getRandomNumber(0, 360))
				setAccuracy(location.coords.accuracy)
				setState((s) => {
					setWorkoutItem(location)

					if (s.myLocations) {
						return { ...s, myLocations: [...s.myLocations, location] }
					} else {
						return { ...s, myLocations: [location] }
					}
				})
			}
		)
	}

	const startHeadingTracking = async () => {
		headingSubscriptionRef.current = await Location.watchHeadingAsync((data) => {
			setHeading(data.trueHeading ?? data.magHeading)
		})
	}

	const checkPermissions = async () => {
		const foregroundStatus = await Location.getForegroundPermissionsAsync()
		const backgroundStatus = await Location.getForegroundPermissionsAsync()

		return {
			foregroundStatus,
			backgroundStatus
		}
	}

	const handleClickStart = async () => {
		const { foregroundStatus, backgroundStatus } = await checkPermissions()

		if (foregroundStatus.granted && backgroundStatus.granted) {
			// можно запускаться
			// router.navigate('/training/started?action=start')

			console.log('chosenWorkout', state.chosenWorkout)
			setWorkoutStage(WORKOUT_STAGE.PROCESSING)
			setState((s) => ({ ...s, isWorkoutStarted: true }))
			await startHeadingTracking()
			return startTracking()
		} else {
			toast.error('Невозможно начать тренировку без предоставления разрешений')
			setState((s) => ({ ...s, retryPermissions: !s.retryPermissions }))
		}
	}

	const handleChangeWorkout = (workoutId: number) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.id === workoutId)
		if (!foundedWorkout) return
		setState((s) => ({ ...s, chosenWorkout: foundedWorkout }))
	}

	const handleClickPause = () => {
		setState((s) => ({ ...s, isPaused: !s.isPaused }))
	}

	const loadAndSetSavedLocations = () => {
		const allSavedLocations = getAllWorkoutStorage()
		setState((s) => ({ ...s, myLocations: allSavedLocations }))
	}

	useEffect(() => {
		loadAndSetSavedLocations()

		return () => {
			if (locationSubscriptionRef.current) {
				locationSubscriptionRef.current.remove()
			}
			if (headingSubscriptionRef.current) {
				headingSubscriptionRef.current.remove()
			}
		}
	}, [])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					{state.isWorkoutStarted ? (
						<WorkoutStarted
							userLocations={state.myLocations}
							handleClickPause={handleClickPause}
							isPaused={state.isPaused}
							markerPosition={markerPosition}
							accuracy={accuracy}
							heading={heading}
						/>
					) : (
						<NewWorkout
							markerPosition={markerPosition}
							accuracy={accuracy}
							heading={heading}
							retryPermissions={state.retryPermissions}
							handleClickStart={handleClickStart}
							handleChangeWorkout={handleChangeWorkout}
							chosenWorkout={state.chosenWorkout}
							WorkoutTypesData={WorkoutTypesData}
						/>
					)}
				</SafeAreaView>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative'
	}
})
