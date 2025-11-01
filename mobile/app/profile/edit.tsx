import React, { useEffect, useState } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Text
} from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'expo-router'
import { editProfileDataWithAvatar, getProfileData } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { lengths } from '../../../shared/lengths'
import * as Haptics from 'expo-haptics'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import EditAvatarModalContent from '@/components/profile/EditAvatarModalContent'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { IActivity } from '@/api/activities'
import { useAuthStore } from '@/store/authStore'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'

interface IEditProfileFormState {
	name: string
	username: string
	avatarFilename?: string | null
}

const FormData = global.FormData

const ProfileEdit = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()
	const { handleSubmit, control, setValue, getValues } = useForm<IEditProfileFormState>()
	const { ErrorMessages } = useErrorMessage()
	const toast = useToast()
	const { setUser } = useAuthStore()
	const { newActivitiesOrder, setNewActivitiesOrder } = useEditActivitiesStore()

	const [data, setData] = useState<{
		activities: IActivity[]
		avatarModal: boolean
		isLoading: boolean
		isSaved: boolean
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		activities: [],
		avatarModal: false,
		isLoading: false,
		isSaved: false,
		errors: {} as { [key: string]: string | boolean | undefined }
	})
	const [avatar, setAvatar] = useState<string | null>(null)

	const setImage = (image: null | string) => {
		setAvatar(image)
		setValue('avatarFilename', image)
	}

	useEffect(() => {
		;(async () => {
			try {
				const profileData = await getProfileData()
				const defaultUserImage = PATH_TO_IMAGE + profileData?.user.avatarFilename

				setImage(defaultUserImage)
				setValue('username', profileData.user.username)
				setValue('name', profileData.user.name || '')
				setData((s) => ({ ...s, activities: profileData.activities }))
			} catch (e) {
				const errors = await e.response.json()
				console.log(errors)
				const formattedErrors = getFieldsErrors(errors)
				setData((s) => ({ ...s, errors: formattedErrors }))
			}
		})()
	}, [])

	const onSubmit = async (editProfileFormState: IEditProfileFormState) => {
		setData((s) => ({ ...s, isLoading: true, errors: undefined }))

		const formData = new FormData()
		if (editProfileFormState.name) {
			formData.append('name', editProfileFormState.name)
		}
		if (editProfileFormState.username) {
			formData.append('username', editProfileFormState.username)
		}
		if (editProfileFormState.avatarFilename) {
			if (editProfileFormState.avatarFilename.startsWith('file://')) {
				const filename = editProfileFormState.avatarFilename.split('/').pop()
				const match = /\.(\w+)$/.exec(filename || '')
				const type = match ? `image/${match[1]}` : 'image/jpeg'

				formData.append('avatarFilename', {
					uri: editProfileFormState.avatarFilename,
					type,
					name: filename || 'profile-image.jpg'
				} as unknown as Blob)
			} else {
				formData.append('avatarFilename', editProfileFormState.avatarFilename)
			}
		}

		if (newActivitiesOrder?.length) {
			formData.append('activities', newActivitiesOrder.map((activity) => activity.name).join(','))
		}

		try {
			const editResponse = await editProfileDataWithAvatar(formData)
			setUser(editResponse.user)
			Keyboard.dismiss()
			toast.success('Данные успешно сохранены')
		} catch (e) {
			const errors = await e.response.json()
			console.log(errors.message)
			const formattedErrors = getFieldsErrors(errors)
			setData((s) => ({ ...s, errors: formattedErrors }))
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
			// Alert.alert('Ошибка', 'Неверные учетные данные')
		} finally {
			setData((s) => ({ ...s, isLoading: false }))
		}
	}

	const handleShowAvatarModal = () => {
		setData((s) => ({ ...s, avatarModal: true }))
	}

	const handleCloseAvatarModal = () => {
		setData((s) => ({ ...s, avatarModal: false }))
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

	const handleClickReturnToProfile = () => {
		if (!data.isSaved) {
			setNewActivitiesOrder([])
		}
	}

	const sourceArray = newActivitiesOrder?.length ? newActivitiesOrder : data.activities
	const activitiesToRender = sourceArray.length >= 3 ? sourceArray.slice(0, 3) : []

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Modal isOpen={data.avatarModal} handleClose={handleCloseAvatarModal} label="Фото профиля" labelSize={16}>
				<EditAvatarModalContent
					handleCloseModal={handleCloseAvatarModal}
					handleClickDeleteAvatar={handleDeleteAvatar}
					setNewAvatar={(image: string) => setImage(image)}
				/>
			</Modal>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
				<Container className="gap-[20px]">
					<HeaderBack returnCallback={handleClickReturnToProfile}>Редактирование профиля</HeaderBack>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="gap-[20px]">
							<View className="gap-[16px]">
								<View className="flex-row justify-between w-full">
									<TouchableOpacity onPress={handleShowAvatarModal}>
										<UserAvatar
											isEditMode
											className="w-[117px] h-[117px]"
											iconSize={{ width: 60, height: 60 }}
											avatar={avatar}
										/>
									</TouchableOpacity>
								</View>
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
												textContentType="nickname"
												keyboardType="default"
												placeholder="examplenickname194"
												error={error?.message || data.errors?.username}
												autoCapitalize="none"
												onChangeText={onChange}
												value={value}
												onBlur={onBlur}
											/>
										)}
									/>
								</View>
							</View>
							<TouchableOpacity onPress={() => router.push('/profile/editActivity')}>
								<ActivityInfo
									activities={activitiesToRender}
									isEditMode
									label="Топ 3 активности на показ"
								/>
							</TouchableOpacity>
							<View className="my-[30px]">
								<Button onPress={handleSubmit(onSubmit)} variant="white" isLoading={data.isLoading}>
									Сохранить
								</Button>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</Container>
			</KeyboardAvoidingView>
		</SafeAreaProvider>
	)
}

export default ProfileEdit
