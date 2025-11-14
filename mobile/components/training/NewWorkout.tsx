import React, { useCallback, useRef } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import MapComponent, { ILatLng, MapComponentHandle } from '@/components/map/MapComponent'
import { FlatList, View } from 'react-native'
import { MapActionButton } from '@/components/map/MapActionButton'
import { StartButton } from '@/components/map/StartButton'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import AllGeolocationPermissions, { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import BottomSheetResizable, {
	BottomSheetResizableRef
} from '@/components/ui/BottomSheetResizable/BottomSheetResizable'
import WorkoutType from '@/components/WorkoutType'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrainingType } from '@shared/enums'
import { UserLocationMarkerHandle } from '@/components/ui/UserLocationMarker'

export interface IWorkoutModeElement {
	id: number
	name: string
	type: TrainingType
	IconComponent: (props: { color?: string }) => React.JSX.Element
}

interface IProps {
	initialMarkerLocation?: ILatLng | null
	chosenWorkout: IWorkoutModeElement | null
	handleChangeWorkout: (workoutId: number) => void
	handleClickStart: () => void
	allPermsGranted: () => void
	WorkoutTypesData: IWorkoutModeElement[]
	permissionsRef: React.RefObject<AllGeolocationPermissionsHandle | null>
	mapComponentRef: React.RefObject<MapComponentHandle | null>
	userLocationMarkerRef: React.RefObject<UserLocationMarkerHandle | null>
}

const NewWorkout = (props: IProps) => {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)

	const toggleResizableSheet = useCallback(() => {
		const isSheetActive = bottomSheetResizableRef.current?.isActive?.()
		bottomSheetResizableRef?.current?.scrollTo?.(isSheetActive ? 0 : -200)
	}, [])

	const handleChangeWorkout = (workoutId: number) => {
		toggleResizableSheet()
		props.handleChangeWorkout(workoutId)
	}

	const renderIcon = (IconComponent: React.ComponentType<any>, color?: string) => {
		return <IconComponent color={color} />
	}

	return (
		<>
			<Container>
				<HeaderBack className="my-[20px]">Новая тренировка</HeaderBack>
			</Container>
			<MapComponent
				ref={props.mapComponentRef}
				initialMarkerLocation={props.initialMarkerLocation}
				userLocationMarkerRef={props.userLocationMarkerRef}
			/>
			<View
				style={{
					bottom: insets.bottom + 35,
					zIndex: 1,
					elevation: 1
				}}
				pointerEvents="box-none"
				className="-translate-x-[50%] left-[50%] absolute flex-row justify-around items-center w-full"
			>
				<MapActionButton onPress={toggleResizableSheet}>
					{props.chosenWorkout && renderIcon(props.chosenWorkout.IconComponent, '#fff')}
					{/*<SneakerSvg />*/}
				</MapActionButton>
				<StartButton onPress={props.handleClickStart}>Начать</StartButton>
				<MapActionButton onPress={() => router.navigate('/find-people')}>
					<PeopleAddSvg />
				</MapActionButton>
			</View>
			<AllGeolocationPermissions
				ref={props.permissionsRef}
				allPermissionsGrantedCallback={props.allPermsGranted}
			/>
			<BottomSheetResizable ref={bottomSheetResizableRef}>
				<Container className="flex-1">
					<FlatList
						data={props.WorkoutTypesData}
						renderItem={({ item }) => (
							<WorkoutType
								id={item.id}
								handleChange={handleChangeWorkout}
								icon={(color) => renderIcon(item.IconComponent, color)}
								name={item.name}
							/>
						)}
						keyExtractor={(_, idx) => idx.toString()}
						ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
						ListFooterComponent={<View style={{ height: insets.bottom + insets.top + 72 }} />}
						nestedScrollEnabled
						showsVerticalScrollIndicator={false}
					/>
				</Container>
			</BottomSheetResizable>
		</>
	)
}

export default NewWorkout
