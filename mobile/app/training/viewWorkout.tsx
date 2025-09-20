import { Pressable, Image, View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { useRouter } from 'expo-router'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import React, { useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import Parameter from '@/components/training/Parameter'
import { Button } from '@/components/ui/Button'
import MapComponent from '@/components/map/MapComponent'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'
import { Input } from '@/components/ui/Input'
import CrossSvg from '@/components/svg/CrossSvg'
import LineChartComponent from '@/components/LineChart/LineChart'

export default function ViewWorkout() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const [state, setState] = useState<{
		switchChartView: 'map' | 'chart'
	}>({
		switchChartView: 'map'
	})

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, icon: <EyeSvg color={Colors['green-main']} opened={true} /> },
		{ id: 2, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['blue-00']} opened={false} /> },
		{ id: 3, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['orange-main']} opened={false} /> },
		{ id: 4, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 5, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 6, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> },
		{ id: 7, name: 'Джефф Безос', avatar: false, icon: <EyeSvg color={Colors['gray-d9']} opened={true} /> }
	]

	return (
		<ScrollView style={{ flex: 1, paddingBottom: insets.bottom + 50 }} contentContainerStyle={{ flexGrow: 1 }}>
			<View className="relative" style={{ height: 300 }}>
				<Image
					className="w-full h-full"
					source={require('@/assets/images/view-training.webp')}
					resizeMode="cover"
				/>
				<Container
					className="absolute w-full h-full inset-0 justify-between pb-4"
					style={{ paddingTop: insets.top + 40 }}
				>
					<Pressable onPress={() => router.back()}>
						<ArrowBackSvg />
					</Pressable>
					<View className="flex-row w-full justify-between items-center">
						<View className="flex-row items-center gap-[10px]">
							<View className="bg-white rounded-xl items-center justify-center w-[40px] h-[40px]">
								<PeopleRunningSvg width={21} height={21} />
							</View>
							<Text className="text-white text-[23px]" style={{ fontFamily: fontFamily.bold }}>
								24 км
							</Text>
						</View>
						<Text className="text-white text-[13px]" style={{ fontFamily: fontFamily.medium }}>
							Сегодня, 10:29 - 11:19
						</Text>
					</View>
				</Container>
			</View>

			<Container className="mt-[20px]" style={{ paddingBottom: insets.bottom + 20 }}>
				<View className="gap-[15px]">
					<View className="bg-black-25 rounded-[25px] p-[15px] gap-[15px]">
						<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
							Сведения о тренировке
						</Text>
						<View className="w-full flex-row justify-between">
							<View className="gap-[15px]">
								<Parameter label={'Время'} value={'50:00'} />
								<Parameter label={'Время'} value={'50:00'} />
								<Parameter label={'Время'} value={'50:00'} />
							</View>
							<View className="gap-[15px]">
								<Parameter label={'Время'} value={'50:00'} />
								<Parameter label={'Время'} value={'50:00'} />
								<Parameter label={'Время'} value={'50:00'} />
							</View>
						</View>
					</View>

					<View className="flex-row gap-[10px]">
						<Button
							onPress={() => setState((s) => ({ ...s, switchChartView: 'map' }))}
							buttonContainerClassName="flex-col flex-1"
							variant="black"
						>
							Карта
						</Button>
						<Button
							onPress={() => setState((s) => ({ ...s, switchChartView: 'chart' }))}
							buttonContainerClassName="flex-col flex-1"
							variant="white"
						>
							График
						</Button>
					</View>
					{state.switchChartView === 'map' && <MapComponent minMapHeight={320} rounded={25} />}
					{state.switchChartView === 'chart' && (
						<View className="rounded-[25px] p-[15px] items-center justify-center bg-black-25 h-[320px]">
							<LineChartComponent />
						</View>
					)}
				</View>
				<View className="mt-[20px] gap-[15px]">
					<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
						Участники
					</Text>
					<View className="gap-[15px]">
						{data.map((user) => (
							<PeopleListItem key={user.id} {...user} />
						))}
					</View>
				</View>
				<View className="mt-[20px] gap-[15px]">
					<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
						Публикация
					</Text>
					<View className="gap-[10px]">
						<Input placeholder="Введите заголовок" />
						<Input placeholder="Введите описание" />
					</View>
					<View className="flex-row gap-[15px]">
						<View className="flex-1 h-[150px] ">
							<Image
								className="w-full h-full rounded-[15px] border-[1px] border-white/20 relative"
								source={require('@/assets/images/carousel/carousel-1.webp')}
								resizeMode="cover"
							/>
							<Pressable className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/20 items-center justify-center">
								<CrossSvg />
							</Pressable>
						</View>
						<View className="flex-1 h-[150px] ">
							<Image
								className="w-full h-full rounded-[15px] border-[1px] border-white/20 relative"
								source={require('@/assets/images/carousel/carousel-1.webp')}
								resizeMode="cover"
							/>
							<Pressable className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/20 items-center justify-center">
								<CrossSvg />
							</Pressable>
						</View>
					</View>
					<View className="gap-[10px] mt-[15px]">
						<Button variant="white">Добавить фото</Button>
						<Button variant="green">Поделиться</Button>
					</View>
				</View>
			</Container>
		</ScrollView>
	)
}
