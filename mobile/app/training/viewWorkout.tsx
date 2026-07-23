import { ActivityIndicator, Platform, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import Parameter from '@/components/training/Parameter'
import { Button } from '@/components/ui/Button'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'
import { Input } from '@/components/ui/Input'
import RoundedMiniButton from '@/components/ui/RoundedMiniButton'
import { IWorkoutResultsStore, useWorkoutResultsAfterFinishStore } from '@/store/workoutResultsAfterFinishStore'
import { format } from 'date-fns'
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
import { IPost } from '@/api/posts'
import { CharacterCounter } from '@/components/ui/CharacterCounter'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { TrainingType } from '@shared/enums'
import { WorkoutTypesMap } from '@/constants/WorkoutTypes'
import { formatDistance } from '@/helpers/distance'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { validateFile } from '@/helpers/fileValidation'
import { ITrainingMetrics } from '@/api/workout'
import { useAuthStore } from '@/store/authStore'
import { formatTimeFromSecondsCompact } from '@/helpers/formatTime'
import { mpsToKmph } from '@/helpers/mpsToKmph'
import { formatBackendPace } from '@/helpers/formatBackendPace'
import { saveSingleWorkout, WorkoutSource } from '@/helpers/saveUnsavedTraining'
import { RoundedButton } from '@/components/ui/HeaderBack'
import { useCreatePostMutation, usePostByTrainingQuery, usePostQuery, useUpdatePostMutation } from '@/queries/posts'
import { useExtendedDetailsWorkoutQuery, useFinishWorkoutMutation } from '@/queries/workout'
import { Page } from '@/components/ui/Page'
import { DEFAULT_PADDING_TOP } from '@/constants/Variables'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import WorkoutMap from '@/components/map/WorkoutMap'
import { File, Paths } from 'expo-file-system'
import { ImageEditorResult } from '@/components/image-editor/types'
import { ImageEditor } from '@/components/image-editor/ImageEditor'
import PenSvg from '@/components/svg/PenSvg'
import { POST_MAX_FILES_COUNT } from '@shared/constants'
import { getNoun } from '@/helpers/getNoun'

type Param = {
	label: string
	value?: string | number | null
}

const workoutResultImages: Record<TrainingType, number> = {
	[TrainingType.RUN]: require('@/assets/images/view-workout-results/run.avif'),
	[TrainingType.WALK]: require('@/assets/images/view-workout-results/walk.avif'),
	[TrainingType.TRACK]: require('@/assets/images/view-workout-results/track.avif'),
	[TrainingType.BICYCLE]: require('@/assets/images/view-workout-results/bicycle.avif')
}

const getWorkoutResultImage = (workoutType?: TrainingType | null) => {
	return workoutResultImages[workoutType ?? TrainingType.RUN]
}

const getWorkoutParams = ({
	mode,
	results,
	creatorMetrics,
	myMetrics
}: {
	mode: VIEW_WORKOUT_MODE
	results: IWorkoutResultsStore
	creatorMetrics?: ITrainingMetrics
	myMetrics?: ITrainingMetrics
}): [Param[], Param[]] => {
	if (mode === VIEW_WORKOUT_MODE.VIEW) {
		return [
			[
				{ label: 'Время', value: results.metrics?.totalTimeFormatted },
				{ label: 'Дистанция', value: results.metrics?.totalDistanceFormatted },
				{ label: 'Ккал', value: results.metrics?.totalCalories }
			],
			[
				{ label: 'Высота', value: results.metrics?.totalHeight },
				{ label: 'Ср. скорость', value: results.metrics?.totalAvgSpeed },
				{ label: 'Cр. темп', value: results.metrics?.totalAvgPace }
			]
		]
	}

	const metrics = mode === VIEW_WORKOUT_MODE.FROM_HISTORY ? myMetrics : creatorMetrics

	return [
		[
			{
				label: 'Время',
				value: formatTimeFromSecondsCompact(metrics?.timeSec)
			},
			{
				label: 'Дистанция',
				value: formatDistance(metrics?.distanceM || 0)
			},
			{ label: 'Ккал', value: metrics?.kkcal }
		],
		[
			{
				label: 'Высота',
				value: `${metrics?.altitudeGainM || '-'} м`
			},
			{
				label: 'Ср. скорость',
				value: mpsToKmph(metrics?.avgSpeedMPerSec || 0)
			},
			{
				label: 'Cр. темп',
				value: formatBackendPace(metrics?.avgTempoSecondsPerKm)
			}
		]
	]
}

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

export enum VIEW_WORKOUT_MODE {
	VIEW = 'view',
	EDIT = 'edit',
	FROM_HISTORY = 'from_history'
}

type PostImageItem = { id: string; kind: 'existing'; fileName: string } | { id: string; kind: 'new'; uri: string }

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

export default function ViewWorkout() {
	const { user } = useAuthStore()
	const isIOS = Platform.OS === 'ios'
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { mode, editPostId, historyTrainingId, unsavedStartedAt } = useLocalSearchParams<{
		mode: VIEW_WORKOUT_MODE
		editPostId?: string
		historyTrainingId?: string
		unsavedStartedAt?: string
	}>()
	const isView = mode === VIEW_WORKOUT_MODE.VIEW
	const isEdit = mode === VIEW_WORKOUT_MODE.EDIT
	const isFromHistory = mode === VIEW_WORKOUT_MODE.FROM_HISTORY

	const { handleSubmit, control, setValue } = useForm<IPostFormState>()
	const { ErrorMessages } = useErrorMessage()

	const { mutateAsync: finishWorkout } = useFinishWorkoutMutation()
	const { mutateAsync: createPostMutation, isPending: isPendingCreate } = useCreatePostMutation()
	const { mutateAsync: updatePostMutation, isPending: isPendingUpdate } = useUpdatePostMutation()

	const results = useWorkoutResultsAfterFinishStore((state) => state)
	const descriptionRef = useRef<TextInput>(null)

	const [frozenPoints] = useState(() => results.points || [])
	const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
	const [isExitWithoutCreatePostModal, setIsExitWithoutCreatePostModal] = useState(false)
	const [imageItems, setImageItems] = useState<PostImageItem[]>([])
	const [deletedImages, setDeletedImages] = useState<string[]>([]) // остаётся как было, для submit
	const [imageEditingUri, setImageEditingUri] = useState<string | null>(null)
	const [editingItemId, setEditingItemId] = useState<string | null>(null)
	const [preparingItemId, setPreparingItemId] = useState<string | null>(null) // скачивание existing-файла перед редактором
	const [viewedAt] = useState(() => Date.now())

	const [state, setState] = useState<{
		switchChartView: 'map' | 'chart'
		editPost: null | IPost
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		switchChartView: 'map',
		editPost: null,
		errors: {} as { [key: string]: string | boolean | undefined }
	})

	const { data: editPost } = usePostQuery(editPostId)
	const { data: postFromTraining } = usePostByTrainingQuery(historyTrainingId) // id тренировки может существовать, но поста может не существовать

	const existPost = useMemo(() => {
		return editPost ?? postFromTraining ?? null
	}, [editPost, postFromTraining])

	useEffect(() => {
		if (editPost) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- инициализация локальных полей формы данными асинхронного запроса
			setImageItems(editPost.fileNames.map((fileName) => ({ id: fileName, kind: 'existing' as const, fileName })))
			setValue('title', editPost.title)
			setValue('description', editPost.description || '')
		}
	}, [editPost, setValue])

	useEffect(() => {
		if (postFromTraining) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- инициализация локальных полей формы данными асинхронного запроса
			setImageItems(
				postFromTraining.fileNames.map((fileName) => ({ id: fileName, kind: 'existing' as const, fileName }))
			)
			setValue('title', postFromTraining.title)
			setValue('description', postFromTraining.description || '')
		}
	}, [postFromTraining, setValue])

	const { data: extendedTrainingDetails } = useExtendedDetailsWorkoutQuery(historyTrainingId)

	const isTrainingAuthor = useMemo(() => {
		if (postFromTraining) return postFromTraining.training?.creatorId === user?.id
		if (extendedTrainingDetails) return extendedTrainingDetails.creatorId === user?.id
		return false
	}, [postFromTraining, extendedTrainingDetails, user?.id])

	const handlePostImages = (postImages: string[], formData: FormData) => {
		postImages.forEach((postImage) => {
			formData.append('files', new File(postImage))
		})
	}

	const saveWorkoutBeforeSubmit = async (): Promise<string | null> => {
		// Если появился интернет
		try {
			return await saveSingleWorkout(WorkoutSource.UNSAVED, Number(unsavedStartedAt), finishWorkout, user?.id)
		} catch (e) {
			console.error(e)
			toast.error('Ошибка при сохранении тренировки, её можно будет сохранить позже')
			return null
		}
	}

	const onSubmit = async (postFormState: IPostFormState) => {
		setState((s) => ({ ...s, isLoading: true, errors: undefined }))

		try {
			const formData = new FormData()
			if (isView && results.trainingId) {
				formData.append('trainingId', results.trainingId)
			}
			if (isView && !results.trainingId && unsavedStartedAt) {
				const newTrainingId = await saveWorkoutBeforeSubmit()
				if (newTrainingId) {
					formData.append('trainingId', newTrainingId)
				}
			}
			if (isFromHistory && historyTrainingId && !existPost) {
				formData.append('trainingId', historyTrainingId)
			}

			formData.append('title', postFormState.title)

			if (postFormState.description) {
				formData.append('description', postFormState.description)
			}

			const newFilesToUpload = imageItems
				.filter((i): i is Extract<PostImageItem, { kind: 'new' }> => i.kind === 'new')
				.map((i) => i.uri)
			handlePostImages(newFilesToUpload, formData)

			if (isView) {
				await createPostMutation(formData)
			}
			if (isEdit && editPostId) {
				if (deletedImages.length) {
					formData.append('deletedFilenames', deletedImages.join(','))
				}
				await updatePostMutation({ postId: editPostId, data: formData })
			}
			if (isFromHistory && !existPost) {
				await createPostMutation(formData)
			}
			if (isFromHistory && existPost) {
				if (deletedImages.length) {
					formData.append('deletedFilenames', deletedImages.join(','))
				}
				await updatePostMutation({ postId: existPost.id, data: formData })
			}
			return router.replace('/(tabs)/profile')
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e)
			setState((s) => ({ ...s, errors: formattedErrors }))
		} finally {
			setState((s) => ({ ...s, isLoading: false }))
		}
	}

	const pickPostImage = async (mode: ImagePickMode) => {
		setIsPhotoModalOpen(false)
		try {
			let result: ImagePicker.ImagePickerResult

			if (mode === ImagePickMode.GALLERY) {
				await ImagePicker.requestMediaLibraryPermissionsAsync()
				result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					// allowsEditing: true,
					quality: 0.7,
					selectionLimit: POST_MAX_FILES_COUNT,
					allowsMultipleSelection: true
				})
			} else {
				await ImagePicker.requestCameraPermissionsAsync()
				result = await ImagePicker.launchCameraAsync({
					allowsEditing: true,
					quality: 0.7
				})
			}

			if (result.canceled || !result.assets?.length) return

			const images = result.assets.map((a) => a.uri)

			const availableSlots = POST_MAX_FILES_COUNT - imageItems.length
			if (availableSlots <= 0) {
				const { number, word } = getNoun(POST_MAX_FILES_COUNT, 'файла', 'файлов', 'файлов')
				toast.error(`Нельзя загружать больше ${number} ${word}`)
				return
			}

			const imagesToAdd = images.slice(0, availableSlots)
			const skippedCount = images.length - imagesToAdd.length

			const { isValid, errorMessage } = validateFile(imagesToAdd)

			if (!isValid) {
				toast.error(errorMessage || 'Файл не прошёл проверку')
				return
			}

			setImageItems((prev) => [
				...prev,
				...imagesToAdd.map((uri) => ({ id: generateId(), kind: 'new' as const, uri }))
			])

			if (skippedCount > 0) {
				const { number, word } = getNoun(POST_MAX_FILES_COUNT, 'файла', 'файлов', 'файлов')
				const { number: skippedNumber, word: skippedWord } = getNoun(skippedCount, 'файл', 'файла', 'файлов')
				toast.error(
					`Добавлено ${imagesToAdd.length} из ${images.length} — лимит ${number} ${word} на пост. ${skippedNumber} ${skippedWord} не добавлено`
				)
			}
		} catch {
			toast.error('Ошибка при загрузке изображения')
		}
	}

	const handleDeleteImageItem = (id: string) => {
		const item = imageItems.find((i) => i.id === id)
		if (item?.kind === 'existing') {
			setDeletedImages((prev) => [...prev, item.fileName])
		}
		setImageItems((prev) => prev.filter((i) => i.id !== id))
	}

	const myParticipant = extendedTrainingDetails?.participants.find((p) => p.user.id === user?.id)
	const creatorParticipant = existPost?.training.participants.find(
		(participant) => participant.user.id === existPost?.userCreator.id
	)

	const adaptedLocationsFromHistory = adaptLocations(myParticipant?.route?.points || [])
	const adaptedLocations = adaptLocations(creatorParticipant?.route?.points || [])

	const creatorMetrics = creatorParticipant?.metrics
	const myMetrics = myParticipant?.metrics

	const distanceText = isView
		? results.metrics?.totalDistanceFormatted
		: formatDistance((isEdit ? creatorMetrics : myMetrics)?.distanceM || 0)

	const dateText = isView
		? `Сегодня, ${results.startedAt ? format(results.startedAt, 'HH:mm') : ''} - ${format(viewedAt, 'HH:mm')}`
		: formatRelativeDate(isEdit ? existPost?.createdAt : extendedTrainingDetails?.createdAt)

	const mapLocations = isView ? frozenPoints : isEdit ? adaptedLocations : adaptedLocationsFromHistory
	const chartPoints = isView ? results.points : isEdit ? adaptedLocations : adaptedLocationsFromHistory

	const canPublish = useMemo(() => {
		return isView || isEdit || (isFromHistory && isTrainingAuthor)
	}, [isEdit, isFromHistory, isTrainingAuthor, isView])

	const canManageExistingImages = useMemo(() => {
		return isEdit || Boolean(isFromHistory && isTrainingAuthor && existPost)
	}, [existPost, isEdit, isFromHistory, isTrainingAuthor])

	const currentWorkoutType = isView
		? results.type?.type
		: isEdit
			? existPost?.training?.type
			: extendedTrainingDetails?.type

	const currentWorkout = isView ? results.type : currentWorkoutType ? WorkoutTypesMap[currentWorkoutType] : null
	const CurrentWorkoutIcon = currentWorkout?.IconComponent as React.ComponentType<any> | undefined
	const currentWorkoutImage = getWorkoutResultImage(currentWorkout?.type)

	const [leftParams, rightParams] = getWorkoutParams({
		mode,
		results,
		creatorMetrics,
		myMetrics
	})

	const getSubmitButtonText = () => {
		if (isView) return 'Поделиться'
		if (isEdit) return 'Отредактировать'

		if (isFromHistory) {
			if (existPost) return 'Отредактировать'
			return 'Поделиться'
		}
	}

	const getTitleText = () => {
		if (isView) return 'Публикация'
		if (isEdit) return 'Редактирование публикации'
		if (isFromHistory && isTrainingAuthor && existPost) return 'Редактирование публикации'
		if (isFromHistory && isTrainingAuthor && !existPost) return 'Публикация'
	}

	const handlePressGoBack = () => {
		if (isView) {
			setIsExitWithoutCreatePostModal(true)
		} else {
			router.back()
		}
	}

	const confirmExitWithoutCreatingPost = () => {
		router.replace({
			pathname: '/workout-history',
			params: {
				from: 'viewWorkout'
			}
		})
	}

	const startEditingImageItem = async (item: PostImageItem) => {
		if (item.kind === 'new') {
			setImageEditingUri(item.uri)
			setEditingItemId(item.id)
			return
		}

		setPreparingItemId(item.id)
		try {
			const remoteUrl = `${PATH_TO_IMAGE}${item.fileName}`
			const localFile = await File.downloadFileAsync(
				remoteUrl,
				new File(Paths.cache, `edit-${generateId()}-${item.fileName}`)
			)
			setImageEditingUri(localFile.uri)
			setEditingItemId(item.id)
		} catch {
			toast.error('Не удалось загрузить изображение для редактирования')
		} finally {
			setPreparingItemId(null)
		}
	}

	const handleDoneImageEdit = (result: ImageEditorResult) => {
		const target = imageItems.find((item) => item.id === editingItemId)

		if (target?.kind === 'existing') {
			setDeletedImages((prev) => [...prev, target.fileName])
		}
		if (target) {
			setImageItems((prev) =>
				prev.map((item) => (item.id === target.id ? { id: item.id, kind: 'new', uri: result.uri } : item))
			)
		}

		setImageEditingUri(null)
		setEditingItemId(null)
	}

	return (
		<Page edges={['bottom']}>
			<Modal
				isOpen={isPhotoModalOpen}
				blurDisabled
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
			<Modal
				isOpen={isExitWithoutCreatePostModal}
				blurDisabled
				handleClose={() => setIsExitWithoutCreatePostModal(false)}
				label="Выйти без создания публикации?"
				labelSize={16}
			>
				<View className="gap-[20px]">
					<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
						Тренировка сохранена в истории, а пост создать можно будет позже.
					</Text>
					<View className="flex-row gap-[10px]">
						<Button
							onPress={confirmExitWithoutCreatingPost}
							variant="white"
							buttonContainerClassName="flex-1"
						>
							Да
						</Button>
						<Button
							onPress={() => setIsExitWithoutCreatePostModal(false)}
							variant="white"
							buttonContainerClassName="flex-1"
						>
							Нет
						</Button>
					</View>
				</View>
			</Modal>
			<ImageEditor
				visible={!!imageEditingUri}
				sourceUri={imageEditingUri}
				onCancel={() => {
					setImageEditingUri(null)
					setEditingItemId(null)
				}}
				onDone={handleDoneImageEdit}
				finalizeOptions={{
					resize: { width: 1440 }, // высота посчитается автоматически
					compress: 0.85
				}}
			/>
			<KeyboardAwareScrollView>
				<View className="relative" style={{ height: 300 }}>
					<Image
						style={{
							width: '100%',
							height: '100%'
						}}
						source={currentWorkoutImage}
						contentFit="cover"
					/>
					<Container
						className="absolute w-full h-full inset-0 justify-between pb-4"
						style={{ paddingTop: insets.top + DEFAULT_PADDING_TOP }}
					>
						<RoundedButton onPress={handlePressGoBack} />
						<View className="flex-row w-full justify-between items-center">
							<View className="flex-row items-center gap-[10px]">
								<View className="bg-white rounded-xl items-center justify-center w-[40px] h-[40px]">
									{CurrentWorkoutIcon ? (
										<CurrentWorkoutIcon color="#000" width={21} height={21} />
									) : null}
								</View>
								<Text className="text-white text-[23px]" style={{ fontFamily: fontFamily.bold }}>
									{distanceText}
								</Text>
							</View>
							<Text className="text-white text-[13px]" style={{ fontFamily: fontFamily.medium }}>
								{dateText}
							</Text>
						</View>
					</Container>
				</View>

				<Container className="mt-[20px]">
					<View className="gap-[15px]">
						<View className="bg-black-25 rounded-[25px] p-[15px] gap-[15px]">
							<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
								Сведения о тренировке
							</Text>
							<View className="w-full flex-row justify-between">
								<View className="gap-[15px]">
									{leftParams.map((p) => (
										<Parameter key={p.label} label={p.label} value={p.value} />
									))}
								</View>

								<View className="gap-[15px]">
									{rightParams.map((p) => (
										<Parameter key={p.label} label={p.label} value={p.value} />
									))}
								</View>
							</View>
						</View>
						<View className="flex-row gap-[10px]">
							<Button
								onPress={() => setState((s) => ({ ...s, switchChartView: 'map' }))}
								buttonContainerClassName="flex-col flex-1"
								variant={state.switchChartView === 'map' ? 'white' : 'black'}
							>
								Карта
							</Button>
							<Button
								onPress={() => setState((s) => ({ ...s, switchChartView: 'chart' }))}
								buttonContainerClassName="flex-col flex-1"
								variant={state.switchChartView === 'chart' ? 'white' : 'black'}
							>
								График
							</Button>
						</View>
						{state.switchChartView === 'map' && (
							<WorkoutMap
								key={mapLocations.length || 0} // какое-то время points undefined
								bordered
								rounded={25}
								needFinishMarker
								needFitInitialRoute
								routeColor={user?.color}
								maxContainerHeight={320}
								initialLocations={mapLocations}
							/>
						)}
						{state.switchChartView === 'chart' && (
							<View className="rounded-[25px] p-[15px] items-center justify-center bg-black-25 h-[320px]">
								<View className="w-full pb-[15px]">
									<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
										График темпа
									</Text>
								</View>
								<LineChart points={chartPoints} />
							</View>
						)}
					</View>
					<View className="mt-[20px] gap-[15px] hidden">
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
					{canPublish ? (
						<View className="mt-[20px] gap-[15px]">
							<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
								{getTitleText()}
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
											className="rounded-[8px]"
											placeholder="Введите заголовок"
											error={error?.message || state.errors?.title}
											onChangeText={onChange}
											value={value}
											onBlur={onBlur}
											returnKeyType="next"
											returnKeyLabel="Далее"
											submitBehavior="submit"
											onSubmitEditing={() => descriptionRef.current?.focus()}
										/>
									)}
								/>
								<Controller
									name="description"
									control={control}
									rules={{
										minLength: {
											value: lengths.post.description.min,
											message: ErrorMessages.optionalMin(lengths.post.description.min)
										},
										maxLength: {
											value: lengths.post.description.max,
											message: ErrorMessages.optionalMax(lengths.post.description.max)
										}
									}}
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
										const currentLength = value?.length || 0
										const maxLength = lengths.post.description.max

										return (
											<View className="gap-[6px]">
												<Input
													ref={descriptionRef}
													multiline
													placeholder="Введите описание"
													error={error?.message || state.errors?.description}
													onChangeText={onChange}
													value={value}
													onBlur={onBlur}
												/>
												<View className="items-end">
													<CharacterCounter
														valueLength={currentLength}
														maxLength={maxLength}
													/>
												</View>
											</View>
										)
									}}
								/>
							</View>
							<View className="flex-row flex-wrap -mx-[7.5px] gap-y-[15px] mt-[10px]">
								{imageItems.map((item) => {
									const isExisting = item.kind === 'existing'
									const canManageThis = isExisting ? canManageExistingImages : true
									const uri = isExisting ? `${PATH_TO_IMAGE}${item.fileName}` : item.uri
									const isPreparing = preparingItemId === item.id

									return (
										<View key={item.id} className="w-1/2 px-[7.5px] relative">
											<Image
												source={{ uri }}
												style={{
													width: '100%',
													aspectRatio: 1,
													borderRadius: 15,
													borderWidth: 1,
													borderColor: 'rgba(255, 255, 255, 0.2)',
													overflow: 'hidden'
												}}
												contentFit="cover"
											/>
											{canManageThis && (
												<View className="absolute left-[18px] top-[10px] rounded-full w-[28px] h-[28px] bg-black/40 items-center justify-center">
													{isPreparing ? (
														<ActivityIndicator size="small" color="white" />
													) : (
														<RoundedMiniButton
															onPress={() => startEditingImageItem(item)}
															blurDisabled={!isIOS}
														>
															<PenSvg color="white" />
														</RoundedMiniButton>
													)}
												</View>
											)}
											{canManageThis && (
												<View className="absolute right-[18px] top-[10px] rounded-full w-[28px] h-[28px] bg-black/40 items-center justify-center">
													<RoundedMiniButton
														onPress={() => handleDeleteImageItem(item.id)}
														blurDisabled={!isIOS}
													/>
												</View>
											)}
										</View>
									)
								})}
							</View>
							<View className="gap-[10px] mt-[15px]">
								<Button variant="white" onPress={() => setIsPhotoModalOpen(true)}>
									Добавить фото
								</Button>
								<Button
									variant="green"
									onPress={handleSubmit(onSubmit)}
									isLoading={isPendingCreate || isPendingUpdate}
								>
									{getSubmitButtonText()}
								</Button>
							</View>
						</View>
					) : (
						<View className="mt-[15px]">
							<Text
								style={{ fontFamily: fontFamily.medium }}
								className="text-gray-ab text-base text-center"
							>
								Опубликовать пост может только создатель тренировки
							</Text>
						</View>
					)}
				</Container>
			</KeyboardAwareScrollView>
		</Page>
	)
}
