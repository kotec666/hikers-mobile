import React from 'react'
import { View } from 'react-native'
import CameraSvg from '@/components/svg/CameraSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import GallerySvg from '@/components/svg/GallerySvg'
import * as ImagePicker from 'expo-image-picker'
import ImagePickerButton from '@/components/ui/ImagePickerButton'
import { useToast } from '@/hooks/useToast'
import { validateFile } from '@/helpers/fileValidation'
import { useTranslation } from 'react-i18next'
import { translateArr } from '@/helpers/arrTranslator'

interface IProps {
	handleClickDeleteAvatar: () => void
	handleCloseModal: () => void
	setNewAvatar: (image: string) => void
}

export enum ImagePickMode {
	GALLERY = 'gallery',
	CAMERA = 'camera'
}

const EditAvatarModalContent = (props: IProps) => {
	const toast = useToast()
	const { t } = useTranslation()

	const uploadImage = async (mode: ImagePickMode) => {
		try {
			let result = {} as ImagePicker.ImagePickerResult

			if (mode === ImagePickMode.GALLERY) {
				await ImagePicker.requestMediaLibraryPermissionsAsync()
				result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5
				})
			} else {
				await ImagePicker.requestCameraPermissionsAsync()
				result = await ImagePicker.launchCameraAsync({
					cameraType: ImagePicker.CameraType.front,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5
				})
			}

			if (!result.canceled && result.assets?.length) {
				const pickedUri = result.assets[0].uri

				if (!pickedUri) {
					toast.error(t('ToastMessage.error.invalidFile'))
					return
				}

				// Валидация файла
				const { isValid, errorMessage } = validateFile(pickedUri)

				if (!isValid) {
					toast.error(errorMessage || t('ToastMessage.error.fileDidNotPassVerification'))
					return
				}

				saveImage(pickedUri)
			}
		} catch (e) {
			console.log('Ошибка при загрузке изображения:', e)
			toast.error(t('ToastMessage.error.errorLoadingImage'))
			props.handleCloseModal()
		}
	}

	const buttons = [
		{
			label: 'PhotoPicker.camera',
			icon: <CameraSvg />,
			onPress: () => uploadImage(ImagePickMode.CAMERA)
		},
		{
			label: 'PhotoPicker.gallery',
			icon: <GallerySvg />,
			onPress: () => uploadImage(ImagePickMode.GALLERY)
		},
		{
			label: 'common.delete',
			icon: <DeleteTrashSvg />,
			onPress: props.handleClickDeleteAvatar
		}
	]

	const translatedButtons = translateArr(buttons, 'label', t)

	const saveImage = (image: string) => {
		// update displayed image
		props.setNewAvatar(image)
		props.handleCloseModal()
	}

	return (
		<View className="flex-row gap-[10px] justify-between">
			{translatedButtons.map((button) => (
				<ImagePickerButton
					key={button.label}
					title={button.label}
					icon={button.icon}
					onPress={button.onPress}
				/>
			))}
		</View>
	)
}

export default EditAvatarModalContent
