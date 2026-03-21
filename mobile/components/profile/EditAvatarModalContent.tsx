import React from 'react'
import { View } from 'react-native'
import CameraSvg from '@/components/svg/CameraSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import GallerySvg from '@/components/svg/GallerySvg'
import * as ImagePicker from 'expo-image-picker'
import ImagePickerButton from '@/components/ui/ImagePickerButton'
import { useToast } from '@/hooks/useToast'

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

			if (!result.canceled) {
				// save image
				await saveImage(result.assets[0].uri)
			}
		} catch {
			toast.error('Ошибка при загрузке изображения')
			props.handleCloseModal()
		}
	}

	const buttons = [
		{
			label: 'Камера',
			icon: <CameraSvg />,
			onPress: () => uploadImage(ImagePickMode.CAMERA)
		},
		{
			label: 'Галерея',
			icon: <GallerySvg />,
			onPress: () => uploadImage(ImagePickMode.GALLERY)
		},
		{
			label: 'Удалить',
			icon: <DeleteTrashSvg />,
			onPress: props.handleClickDeleteAvatar
		}
	]

	const saveImage = async (image: string) => {
		try {
			// update displayed image
			props.setNewAvatar(image)
			props.handleCloseModal()
		} catch (e) {
			throw e
		}
	}

	return (
		<View className="flex-row gap-[10px] justify-between">
			{buttons.map((button) => (
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
