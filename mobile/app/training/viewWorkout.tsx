import { Pressable, Image, View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { useRouter } from 'expo-router'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import React, { useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import Parameter from '@/components/training/Parameter'
import { Button } from '@/components/ui/Button'
import MapComponent from '@/components/map/MapComponent'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'
import { Input } from '@/components/ui/Input'
import CloseCross from '@/components/ui/CloseCross'
import { useWorkoutResultsAfterFinishStore } from '@/store/workoutResultsAfterFinishStore'
import { format } from 'date-fns'
import { useInternetConnection } from '@/hooks/useInternetConnection'
import { lengths } from '../../../shared/lengths'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { LineChart } from '@/components/LineChart/LineChart'

interface IPostFormState {
	title: string
	desc: string
}

export default function ViewWorkout() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const { isConnected: isInternetConnected } = useInternetConnection()
	const {
		handleSubmit,
		control,
		formState: { errors }
	} = useForm<IPostFormState>()
	const { ErrorMessages } = useErrorMessage()

	const results = useWorkoutResultsAfterFinishStore((state) => state)

	const [state, setState] = useState<{
		switchChartView: 'map' | 'chart'
		isLoading: boolean
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		switchChartView: 'map',
		isLoading: false,
		errors: {} as { [key: string]: string | boolean | undefined }
	})

	const data = [
		{
			id: '1',
			username: 'stevejobs1',
			name: 'Стив Джобс 1st',
			avatar: null
		},
		{
			id: '2',
			username: 'stevejobs2',
			name: 'Стив Джобс 2nd',
			avatar: null
		},
		{
			id: '3',
			username: 'stevejobs3',
			name: 'Стив Джобс 3rd',
			avatar: null
		},
		{
			id: '4',
			username: 'stevejobs4',
			name: 'Стив Джобс 4th',
			avatar: null
		},
		{
			id: '5',
			username: 'stevejobs5',
			name: 'Стив Джобс 5th',
			avatar: null
		}
	]

	const renderIcon = (IconComponent?: React.ComponentType<any>, color?: string) => {
		if (!IconComponent) return null
		return <IconComponent color={color} width={21} height={21} />
	}

	const onSubmit = async (postFormState: IPostFormState) => {
		setState((s) => ({ ...s, isLoading: true, errors: undefined }))
		try {
			console.log(postFormState)
		} catch (e) {
			const errors = await e.response.json()
			const formattedErrors = getFieldsErrors(errors)
			setState((s) => ({ ...s, errors: formattedErrors }))
		} finally {
			setState((s) => ({ ...s, isLoading: false }))
		}
	}

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
					<Pressable
						onPress={() => {
							router.replace('/workout-history')
						}}
					>
						<ArrowBackSvg />
					</Pressable>
					<View className="flex-row w-full justify-between items-center">
						<View className="flex-row items-center gap-[10px]">
							<View className="bg-white rounded-xl items-center justify-center w-[40px] h-[40px]">
								{renderIcon(results?.type?.IconComponent, '#000')}
								{/* <PeopleRunningSvg width={21} height={21} /> */}
							</View>
							<Text className="text-white text-[23px]" style={{ fontFamily: fontFamily.bold }}>
								{results.metrics?.totalDistanceFormatted}
							</Text>
						</View>
						<Text className="text-white text-[13px]" style={{ fontFamily: fontFamily.medium }}>
							Сегодня, {results.startedAt && format(results.startedAt, 'HH:mm')} -{' '}
							{format(Date.now(), 'HH:mm')}
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
								<Parameter label="Время" value={results.metrics?.totalTimeFormatted} />
								<Parameter label="Дистанция" value={results.metrics?.totalDistanceFormatted} />
								<Parameter label="Ккал" value={results.metrics?.totalCalories} />
							</View>
							<View className="gap-[15px]">
								<Parameter label="Высота" value={results.metrics?.totalHeight} />
								<Parameter label="Ср. скорость" value={results.metrics?.totalAvgSpeed} />
								<Parameter label="Cр. темп" value={results.metrics?.totalAvgPace} />
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
							<View className="w-full pb-[15px]">
								<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
									График темпа
								</Text>
							</View>
							<LineChart points={results.points} />
						</View>
					)}
				</View>
				{isInternetConnected ? (
					<>
						<View className="mt-[20px] gap-[15px]">
							<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
								Участники
							</Text>
							<View className="gap-[15px]">
								{data.map((user) => (
									<PeopleListItem
										key={user.id}
										id={user.id}
										username={user.username}
										name={user.name}
										// avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
										avatar={user.avatar}
										icon={{
											iconSvg: <EyeSvg color={Colors['green-main']} opened={true} />,
											//iconCb: () => handleUnsubscribe(item.user.id)
											iconCb: () => {}
										}}
									/>
								))}
							</View>
						</View>
						<View className="mt-[20px] gap-[15px]">
							<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
								Публикация
							</Text>
							<View className="gap-[10px]">
								<Controller
									name="title"
									control={control}
									rules={{
										required: {
											value: true,
											message: ErrorMessages.required
										},
										minLength: {
											value: lengths.user.email.min,
											message: ErrorMessages.optionalMin(lengths.user.email.min)
										},
										maxLength: {
											value: lengths.user.email.max,
											message: ErrorMessages.optionalMax(lengths.user.email.max)
										}
									}}
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<Input
											placeholder="Введите заголовок"
											error={error?.message || state.errors?.title}
											onChangeText={onChange}
											value={value}
											onBlur={onBlur}
										/>
									)}
								/>
								<Controller
									name="desc"
									control={control}
									rules={{
										required: {
											value: true,
											message: ErrorMessages.required
										},
										minLength: {
											value: lengths.user.email.min,
											message: ErrorMessages.optionalMin(lengths.user.email.min)
										},
										maxLength: {
											value: lengths.user.email.max,
											message: ErrorMessages.optionalMax(lengths.user.email.max)
										}
									}}
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<Input
											multiline
											placeholder="Введите описание"
											error={error?.message || state.errors?.desc}
											onChangeText={onChange}
											value={value}
											onBlur={onBlur}
										/>
									)}
								/>
							</View>
							<View className="flex-row gap-[15px]">
								<View className="flex-1 h-[150px] ">
									<Image
										className="w-full h-full rounded-[15px] border-[1px] border-white/20 relative"
										source={require('@/assets/images/carousel/carousel-1.webp')}
										resizeMode="cover"
									/>
									<View className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/20 items-center justify-center overflow-hidden">
										<CloseCross />
									</View>
								</View>
								<View className="flex-1 h-[150px] ">
									<Image
										className="w-full h-full rounded-[15px] border-[1px] border-white/20 relative"
										source={require('@/assets/images/carousel/carousel-1.webp')}
										resizeMode="cover"
									/>
									<View className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/20 items-center justify-center overflow-hidden">
										<CloseCross />
									</View>
								</View>
							</View>
							<View className="gap-[10px] mt-[15px]">
								<Button variant="white">Добавить фото</Button>
								<Button variant="green" onPress={handleSubmit(onSubmit)} isLoading={state.isLoading}>
									Поделиться
								</Button>
							</View>
						</View>
					</>
				) : (
					<View className="my-[16px]">
						<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base text-center">
							Нет подключения к интернету, создать пост можно будет позже
						</Text>
					</View>
				)}
			</Container>
		</ScrollView>
	)
}
