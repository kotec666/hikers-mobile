import { Dimensions, Text, View, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'expo-router'
import React, { useCallback, useRef, useState } from 'react'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { fontFamily } from '@/constants/Fonts'
import GeolocationPermissionSvg from '@/components/svg/GeolocationPermissionSvg'
import BottomSheetResizable, {
	BottomSheetResizableRef
} from '@/components/ui/BottomSheetResizable/BottomSheetResizable'
import WorkoutType from '@/components/WorkoutType'
import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import { Container } from '@/components/ui/Container'
import { Notification, NotificationInAppType } from '@/components/Notification'
import NavBar from '@/components/ui/NavBar'

const { height: screenHeight } = Dimensions.get('screen')

export default function HomeScreen() {
	const router = useRouter()

	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)
	const [content, setContent] = useState<React.ReactNode>(null)

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setContent(newContent)
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	const toggleResizableSheet = useCallback(() => {
		const isSheetActive = bottomSheetResizableRef.current?.isActive?.()
		bottomSheetResizableRef?.current?.scrollTo?.(isSheetActive ? 0 : -200)
	}, [])

	// Пример с выводом изображений
	// const data = useMemo(
	// 	() =>
	// 		Array.from({ length: 30 }, (_, index) => ({
	// 			id: index.toString(),
	// 			image: `https://picsum.photos/200/150?random=${index}`
	// 		})),
	// 	[]
	// )
	//
	// const renderItem = useCallback(
	// 	({ item }: { item: { id: string; image: string } }) => (
	// 		<View style={styles.listItem}>
	// 			<Image source={{ uri: item.image }} resizeMode="cover" style={styles.itemImage} />
	// 		</View>
	// 	),
	// 	[]
	// )

	const WorkoutTypesData = [
		{ id: 1, name: 'Забег', icon: <WorkoutRunning /> },
		{ id: 2, name: 'Ходьба', icon: <WorkoutWalking /> },
		{ id: 3, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 4, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 5, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 6, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 7, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 8, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 9, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 10, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 11, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 12, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 13, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 14, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 15, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 16, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 17, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 18, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 19, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 20, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 21, name: 'Велосипед', icon: <WorkoutBicycle /> },
		{ id: 22, name: 'Велосипед last', icon: <WorkoutBicycle /> }
	]

	const renderWorkoutItem = useCallback(
		({ item }: { item: (typeof WorkoutTypesData)[0] }) => <WorkoutType icon={item.icon} name={item.name} />,
		[]
	)
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider>
			<GestureHandlerRootView style={styles.root}>
				<SafeAreaView style={styles.container}>
					<Notification
						text={'Нельзя начать тренировку без предоставления разрешений'}
						type={NotificationInAppType.SUCCESS}
					/>
					<Button variant="white" onPress={() => router.navigate('/hello-screen')}>
						To hello screen
					</Button>
					<Button variant="white" onPress={() => router.navigate('/news-feed')}>
						Страница постов
					</Button>
					<Button
						variant="white"
						onPress={() =>
							openBottomSheet(
								<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
									<View className="items-center gap-[20px]">
										<GeolocationPermissionSvg />
										<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
											Разрешите доступ к геолокации
										</Text>
									</View>
									<View className="w-full gap-[10px]">
										<Button variant="white">Разрешить</Button>
										<Button variant="transparent">Не сейчас</Button>
									</View>
								</View>
							)
						}
					>
						Example 1
					</Button>
					<Button
						variant="white"
						onPress={() =>
							openBottomSheet(
								<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
									<View className="items-center">
										<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
											У вас есть незавершённая
										</Text>
										<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
											тренировка
										</Text>
									</View>
									<View className="w-full gap-[10px]">
										<Button variant="white">Продолжить тренировку</Button>
										<Button variant="white">Завершить тренировку</Button>
										<Button variant="white">Не сохранять</Button>
									</View>
								</View>
							)
						}
					>
						Example 2
					</Button>
					<Button
						variant="white"
						onPress={() =>
							openBottomSheet(
								<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
									<View className="items-center">
										<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
											Чтобы записывать тренировки,
										</Text>
										<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
											нужно включить передачу
										</Text>
										<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
											геоданных.
										</Text>
										<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
											Сделать это сейчас?
										</Text>
									</View>
									<View className="w-full gap-[10px]">
										<Button variant="white">Да</Button>
										<Button variant="transparent">Отмена</Button>
									</View>
								</View>
							)
						}
					>
						Example 3
					</Button>
					<Button
						variant="white"
						onPress={() =>
							openBottomSheet(
								<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
									<View className="items-center gap-[20px]">
										<GeolocationPermissionSvg />
										<View className="items-center">
											<Text
												style={{ fontFamily: fontFamily.bold }}
												className="text-white text-lg"
											>
												Разрешите доступ к геолокации
											</Text>
											<Text
												style={{ fontFamily: fontFamily.bold }}
												className="text-white text-lg"
											>
												в фоновом режиме
											</Text>
										</View>
									</View>
									<View className="w-full gap-[10px]">
										<Button variant="white">Разрешить</Button>
										<Button variant="transparent">Не сейчас</Button>
									</View>
								</View>
							)
						}
					>
						Example 4
					</Button>
					<Button variant="white" onPress={toggleResizableSheet}>
						Example 5
					</Button>
					<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
						{content}
					</BottomSheet>
					<BottomSheetResizable ref={bottomSheetResizableRef}>
						<Container className="flex-1">
							<FlatList
								data={WorkoutTypesData}
								renderItem={renderWorkoutItem}
								keyExtractor={(_, idx) => idx.toString()}
								ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
								ListFooterComponent={<View style={{ height: insets.bottom + 50 }} />}
								nestedScrollEnabled
								showsVerticalScrollIndicator={false}
							/>
						</Container>
						{/*<FlatList*/}
						{/*	data={data}*/}
						{/*	keyExtractor={(item) => item.id}*/}
						{/*	numColumns={2}*/}
						{/*	showsVerticalScrollIndicator={false}*/}
						{/*	contentContainerStyle={styles.listContainer}*/}
						{/*	renderItem={renderItem}*/}
						{/*/>*/}
					</BottomSheetResizable>
					<NavBar />
				</SafeAreaView>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white'
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20
	},
	text: {
		fontSize: 20,
		color: 'black'
	},
	listContainer: {
		paddingTop: 16,
		paddingHorizontal: 10,
		paddingBottom: 65
	},
	listItem: {
		flex: 1,
		height: 200,
		marginBottom: 15,
		marginHorizontal: 5,
		borderRadius: 12,
		backgroundColor: 'white'
	},
	itemImage: {
		height: '100%',
		width: '100%',
		borderRadius: 12
	}
})
