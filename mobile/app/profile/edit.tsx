import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Keyboard, Pressable, TouchableOpacity, View, Text, Dimensions, TextInput } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import * as Haptics from 'expo-haptics'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import EditAvatarModalContent from '@/components/profile/EditAvatarModalContent'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useAuthStore } from '@/store/authStore'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import BlurProvider from '@/components/providers/BlurProvider'
import { lengths } from '@shared/lengths'
import { useProfileQuery, useUpdateProfileMutation } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import BaseWheelPicker from '@/components/ui/wheel-picker/base-wheel-picker'
import { cn } from '@/helpers/cn'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'

interface IEditProfileFormState {
	name: string
	username: string
	weight: number
	avatarFilename?: string | null
}

const { height: SCREEN_HEIGHT } = Dimensions.get('screen')
const FormData = global.FormData

const ProfileEdit = () => {
	const router = useRouter()
	const { push } = useSafeNavigation()
	const { data: profileData, isLoading } = useProfileQuery()
	const {
		handleSubmit,
		control,
		setValue,
		getValues,
		watch,
		formState: { isDirty }
	} = useForm<IEditProfileFormState>({
		values: {
			name: profileData?.user?.name || '',
			username: profileData?.user?.username || '',
			weight: 70, // profileData?.user?.weight || 70
			avatarFilename: PATH_TO_IMAGE + profileData?.user?.avatarFilename
		}
	})
	const weight = watch('weight')
	const [temporaryWeight, setTemporaryWeight] = useState(weight)

	const usernameRef = useRef<TextInput>(null)

	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const { ErrorMessages } = useErrorMessage()
	const toast = useToast()
	const { setUser } = useAuthStore()
	const { newActivitiesOrder, setNewActivitiesOrder } = useEditActivitiesStore()
	const { mutateAsync, isPending } = useUpdateProfileMutation()

	const [data, setData] = useState<{
		avatarModal: boolean
		isSaved: boolean
		notSavedModal: boolean
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		avatarModal: false,
		isSaved: false,
		notSavedModal: false,
		errors: {} as { [key: string]: string | boolean | undefined }
	})
	const [avatar, setAvatar] = useState<string | null>(null)

	const setImage = useCallback(
		(image: null | string) => {
			setAvatar(image)
			setValue('avatarFilename', image)
		},
		[setValue]
	)

	const onSubmit = async (formState: IEditProfileFormState) => {
		setData((s) => ({ ...s, errors: undefined, isSaved: false }))

		const formData = new FormData()

		if (formState.name) {
			formData.append('name', formState.name)
		}

		if (formState.username) {
			formData.append('username', formState.username)
		}

		if (formState.avatarFilename) {
			if (formState.avatarFilename.startsWith('file://')) {
				const filename = formState.avatarFilename.split('/').pop()
				const match = /\.(\w+)$/.exec(filename || '')
				const type = match ? `image/${match[1]}` : 'image/jpeg'

				formData.append('avatarFilename', {
					uri: formState.avatarFilename,
					type,
					name: filename || 'profile-image.jpg'
				} as unknown as Blob)
			} else {
				formData.append('avatarFilename', formState.avatarFilename)
			}
		}

		if (newActivitiesOrder?.length) {
			formData.append('activities', newActivitiesOrder.map((a) => a.name).join(','))
		}

		try {
			const response = await mutateAsync(formData)

			setUser(response.user)

			Keyboard.dismiss()
			setData((s) => ({ ...s, isSaved: true }))
			toast.success('Данные успешно сохранены')
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e)

			setData((s) => ({ ...s, errors: formattedErrors }))
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	const handleShowAvatarModal = () => {
		setData((s) => ({ ...s, avatarModal: true }))
	}

	const handleCloseAvatarModal = () => {
		setData((s) => ({ ...s, avatarModal: false }))
	}

	const handleCloseNotSavedModal = () => {
		setData((s) => ({ ...s, notSavedModal: false }))
	}

	const handleOpenNotSavedModal = () => {
		setData((s) => ({ ...s, notSavedModal: true }))
	}

	const handleDeleteAvatar = async () => {
		try {
			setImage(null)
			handleCloseAvatarModal()
		} catch ({ message }) {
			alert(message)
			handleCloseAvatarModal()
		}
	}

	const exitWithoutSave = () => {
		handleCloseNotSavedModal()
		setNewActivitiesOrder([])
		router.back()
	}

	const handleClickReturnToProfile = () => {
		if (!data.isSaved && isDirty) {
			handleOpenNotSavedModal()
		} else {
			exitWithoutSave()
		}
	}

	const openBottomSheet = useCallback(() => {
		setTemporaryWeight(weight)

		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [weight])

	const handlePressWeightField = () => {
		openBottomSheet()
	}

	const sourceArray = newActivitiesOrder?.length ? newActivitiesOrder : (profileData?.activities ?? [])
	const activitiesToRender = sourceArray.length >= 3 ? sourceArray.slice(0, 3) : []

	const weightPickerWheelData = useMemo(
		() =>
			Array.from({ length: 186 }, (_, index) => {
				const weight = index + 15

				return {
					value: weight,
					label: `${weight} кг`
				}
			}),
		[]
	)

	return (
		<Page>
			<BlurProvider>
				<BottomSheet
					ref={bottomSheetRef}
					activeHeight={SCREEN_HEIGHT * 0.5}
					onDone={() => {
						setValue('weight', temporaryWeight, {
							shouldDirty: true
						})

						bottomSheetRef.current?.closeSheet()
					}}
				>
					<BaseWheelPicker
						data={weightPickerWheelData}
						value={temporaryWeight}
						onChange={(value) => setTemporaryWeight(value)}
						itemHeight={60}
						overlayHeightMultiplier={0.77}
						renderItem={({ item, index }) => (
							<View key={index} className="items-center justify-center h-[60px] w-full">
								<Text
									className={cn('text-[28px]', {
										'text-white font-semibold': temporaryWeight === item.value,
										'text-black-5c': temporaryWeight !== item.value
									})}
								>
									{item.label}
								</Text>
							</View>
						)}
					/>
				</BottomSheet>
				<Modal
					isOpen={data.avatarModal}
					handleClose={handleCloseAvatarModal}
					label="Фото профиля"
					labelSize={16}
				>
					<EditAvatarModalContent
						handleCloseModal={handleCloseAvatarModal}
						handleClickDeleteAvatar={handleDeleteAvatar}
						setNewAvatar={(image: string) => setImage(image)}
					/>
				</Modal>
				<Modal
					isOpen={data.notSavedModal}
					handleClose={handleCloseNotSavedModal}
					label="Выйти без сохранения данных?"
					labelSize={16}
				>
					<View className="gap-[20px]">
						<View className="flex-row gap-[10px]">
							<Button onPress={exitWithoutSave} variant="white" buttonContainerClassName="flex-1">
								Да
							</Button>
							<Button
								onPress={handleCloseNotSavedModal}
								variant="white"
								buttonContainerClassName="flex-1"
							>
								Нет
							</Button>
						</View>
					</View>
				</Modal>
				<Container className="flex-1 gap-[20px]">
					<HeaderBack returnCallback={handleClickReturnToProfile}>Редактирование профиля</HeaderBack>
					<KeyboardAwareScrollView
						contentContainerStyle={{
							flexGrow: 1
						}}
					>
						<View className="flex-1 gap-[20px]">
							<View className="gap-[16px]">
								<TouchableOpacity onPress={handleShowAvatarModal}>
									<UserAvatar
										isEditMode
										className="w-[117px] h-[117px]"
										iconSize={{ width: 60, height: 60 }}
										avatar={avatar || getValues('avatarFilename')}
									/>
								</TouchableOpacity>
								<View className="gap-[10px]">
									<Controller
										name="name"
										control={control}
										rules={{
											required: {
												value: false,
												message: ErrorMessages.required
											},
											pattern: {
												value: /^\D*$/,
												message: ErrorMessages.notNumber
											},
											minLength: {
												value: lengths.user.name.min,
												message: ErrorMessages.optionalMin(lengths.user.name.min)
											},
											maxLength: {
												value: lengths.user.name.max,
												message: ErrorMessages.optionalMax(lengths.user.name.max)
											}
										}}
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
											<Input
												textContentType="name"
												keyboardType="name-phone-pad"
												placeholder="Введите имя"
												error={error?.message || data.errors?.name}
												autoCapitalize="words"
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
												returnKeyType="next"
												returnKeyLabel="Далее"
												submitBehavior="submit"
												onSubmitEditing={() => usernameRef.current?.focus()}
											/>
										)}
									/>
									<Controller
										name="username"
										control={control}
										rules={{
											required: {
												value: true,
												message: ErrorMessages.required
											},
											pattern: {
												value: /^[A-Za-z0-9_]+$/,
												message: ErrorMessages.customMessage(
													'Никнейм содержит недопустимые символы'
												)
											},
											minLength: {
												value: lengths.user.username.min,
												message: ErrorMessages.optionalMin(lengths.user.username.min)
											},
											maxLength: {
												value: lengths.user.username.max,
												message: ErrorMessages.optionalMax(lengths.user.username.max)
											}
										}}
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
											<Input
												ref={usernameRef}
												textContentType="username"
												autoComplete="username"
												keyboardType="default"
												placeholder="Введите логин"
												error={error?.message || data.errors?.username}
												autoCapitalize="none"
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
											/>
										)}
									/>
									<Pressable
										onPress={handlePressWeightField}
										className="border border-black-44 rounded-full p-[16px]"
									>
										<Text className="text-white">Вес {weight} кг</Text>
									</Pressable>
								</View>
							</View>
							<TouchableOpacity onPress={() => push('/profile/editActivity')}>
								<ActivityInfo
									activities={activitiesToRender}
									isEditMode
									label="Топ 3 активности на показ"
								/>
							</TouchableOpacity>
							<View className="flex-1 justify-end">
								<Button
									onPress={handleSubmit(onSubmit)}
									variant="white"
									isLoading={isPending || isLoading}
								>
									Сохранить
								</Button>
							</View>
						</View>
					</KeyboardAwareScrollView>
				</Container>
			</BlurProvider>
		</Page>
	)
}

export default ProfileEdit
