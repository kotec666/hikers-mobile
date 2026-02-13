import { Pressable, Image, View, Text, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { useRouter } from 'expo-router'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import React, { useEffect, useRef, useState } from 'react'
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
import { lengths } from '@/shared/lengths'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { LineChart } from '@/components/LineChart/LineChart'
import { ImagePickMode } from '@/components/profile/EditAvatarModalContent'
import * as ImagePicker from 'expo-image-picker'
import Modal from '@/components/ui/Modal/Modal'
import CameraSvg from '@/components/svg/CameraSvg'
import GallerySvg from '@/components/svg/GallerySvg'
import ImagePickerButton from '@/components/ui/ImagePickerButton'
import { useToast } from '@/hooks/useToast'
import { createPost } from '@/api/posts'
import { useAuthStore } from '@/store/authStore'
import { getExtendedDetails } from '@/api/workout'

interface IPostFormState {
	title: string
	description: string
}

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
	}
]

export default function ViewWorkout() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { isConnected: isInternetConnected } = useInternetConnection()
	const {
		handleSubmit,
		control,
		formState: { errors }
	} = useForm<IPostFormState>()
	const { ErrorMessages } = useErrorMessage()

	const { user } = useAuthStore()
	const results = useWorkoutResultsAfterFinishStore((state) => state)
	const pointsRef = useRef(results.points || [])
	const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
	const [postImages, setPostImages] = useState<string[]>([])
	const [state, setState] = useState<{
		switchChartView: 'map' | 'chart'
		isLoading: boolean
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		switchChartView: 'map',
		isLoading: false,
		errors: {} as { [key: string]: string | boolean | undefined }
	})

	useEffect(() => {
		if (results.trainingId) {
			;(async () => {
				/// await
			})()
		}
	}, [results.trainingId])

	const renderIcon = (IconComponent?: React.ComponentType<any>, color?: string) => {
		if (!IconComponent) return null
		return <IconComponent color={color} width={21} height={21} />
	}

	const handlePostImages = (postImages: string[], formData: FormData) => {
		if (postImages.length) {
			const filesArray: any[] = []

			postImages.forEach((postImage, index) => {
				if (postImage.startsWith('file://')) {
					const filename = postImage.split('/').pop()
					const match = /\.(\w+)$/.exec(filename || '')
					const type = match ? `image/${match[1]}` : 'image/jpeg'

					filesArray.push({
						uri: postImage,
						type,
						name: filename || `post-image-${index}.jpg`
					})
				} else {
					// Если это уже загруженное изображение (URL), отправляем как строку
					// Для URL просто добавляем строку в массив
					filesArray.push(postImage)
				}
			})

			formData.append('files[]', filesArray as unknown as Blob)
		}
	}

	const getParticipantId = async (trainingId: string | null, userId: string | undefined): Promise<string | null> => {
		if (!trainingId || !userId) return null
		const extendedTraining = await getExtendedDetails(trainingId)
		return extendedTraining.participants.find((participant) => participant.user.id === userId)?.id || null
	}

	const onSubmit = async (postFormState: IPostFormState) => {
		setState((s) => ({ ...s, isLoading: true, errors: undefined }))
		try {
			const formData = new FormData()
			const participantId = await getParticipantId(results.trainingId, user?.id)
			if (participantId) {
				formData.append('trainingParticipantId', participantId)
			}
			formData.append('title', postFormState.title)
			if (postFormState.description) {
				formData.append('description', postFormState.description)
			}
			handlePostImages(postImages, formData)
			await createPost(formData)
			toast.success('Пост опубликован')
			router.replace('/(tabs)/profile')
		} catch (e) {
			const errors = await e.response.json()
			console.log(errors.message)
			const formattedErrors = getFieldsErrors(errors)
			setState((s) => ({ ...s, errors: formattedErrors }))
		} finally {
			setState((s) => ({ ...s, isLoading: false }))
		}
	}

	const pickPostImage = async (mode: ImagePickMode) => {
		setIsPhotoModalOpen(false)
		try {
			let result = {} as ImagePicker.ImagePickerResult

			if (mode === ImagePickMode.GALLERY) {
				await ImagePicker.requestMediaLibraryPermissionsAsync()
				result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					allowsEditing: true,
					quality: 0.7
				})
			} else {
				await ImagePicker.requestCameraPermissionsAsync()
				result = await ImagePicker.launchCameraAsync({
					allowsEditing: true,
					quality: 0.7
				})
			}

			if (!result.canceled) {
				setPostImages((prev) => [...prev, result.assets[0].uri])
			}
		} catch (e: any) {
			toast.error('Ошибка при загрузке изображения')
		}
	}

	const handleDeletePostImage = (index: number) => {
		setPostImages((prev) => prev.filter((_, i) => i !== index))
	}

	return (
		<>
			<Modal
				isOpen={isPhotoModalOpen}
				handleClose={() => setIsPhotoModalOpen(false)}
				label="Фото поста"
				labelSize={16}
			>
				<View className="flex-row gap-[10px] justify-between">
					<ImagePickerButton
						title="Камера"
						icon={<CameraSvg />}
						onPress={() => pickPostImage(ImagePickMode.CAMERA)}
					/>
					<ImagePickerButton
						title="Галерея"
						icon={<GallerySvg />}
						onPress={() => pickPostImage(ImagePickMode.GALLERY)}
					/>
				</View>
			</Modal>

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
						{state.switchChartView === 'map' && (
							<MapComponent minMapHeight={320} rounded={25} initialLocations={pointsRef} />
						)}
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
												value: lengths.post.title.min,
												message: ErrorMessages.optionalMin(lengths.post.title.min)
											},
											maxLength: {
												value: lengths.post.title.max,
												message: ErrorMessages.optionalMax(lengths.post.title.max)
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
										name="description"
										control={control}
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
											<Input
												multiline
												placeholder="Введите описание"
												error={error?.message || state.errors?.description}
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
											/>
										)}
									/>
								</View>
								<View className="flex-row flex-wrap -mx-[7.5px] gap-y-[15px] mt-[10px]">
									{postImages.map((uri, index) => (
										<View key={uri} className="w-1/2 px-[7.5px] relative">
											<Image
												source={{ uri }}
												className="w-full aspect-square rounded-[15px] border-[1px] border-white/20"
												resizeMode="cover"
											/>
											<View className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/40 items-center justify-center">
												<CloseCross handleClose={() => handleDeletePostImage(index)} />
											</View>
										</View>
									))}
								</View>
								<View className="gap-[10px] mt-[15px]">
									<Button variant="white" onPress={() => setIsPhotoModalOpen(true)}>
										Добавить фото
									</Button>
									<Button
										variant="green"
										onPress={handleSubmit(onSubmit)}
										isLoading={state.isLoading}
									>
										Поделиться
									</Button>
								</View>
							</View>
						</>
					) : (
						<View className="my-[16px]">
							<Text
								style={{ fontFamily: fontFamily.medium }}
								className="text-gray-ab text-base text-center"
							>
								Нет подключения к интернету, создать пост можно будет позже
							</Text>
						</View>
					)}
				</Container>
			</ScrollView>
		</>
	)
}
