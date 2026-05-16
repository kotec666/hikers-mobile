import React, { useState } from 'react'
import { Page } from '@/components/ui/Page'
import { View, Text, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import CloseCross from '@/components/ui/CloseCross'
import { Button } from '@/components/ui/Button'
import ImagePickerButton from '@/components/ui/ImagePickerButton'
import CameraSvg from '@/components/svg/CameraSvg'
import { ImagePickMode } from '@/components/profile/EditAvatarModalContent'
import GallerySvg from '@/components/svg/GallerySvg'
import Modal from '@/components/ui/Modal/Modal'
import * as ImagePicker from 'expo-image-picker'
import { validateFile } from '@/helpers/fileValidation'
import { useToast } from '@/hooks/useToast'

const Results = () => {
	const toast = useToast()
	const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
	const [postImages, setPostImages] = useState<string[]>([])

	const handleDeletePostImage = (index: number) => {
		setPostImages((prev) => prev.filter((_, i) => i !== index))
	}

	const pickPostImage = async (mode: ImagePickMode) => {
		setIsPhotoModalOpen(false)
		try {
			let result: ImagePicker.ImagePickerResult

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

			if (result.canceled || !result.assets?.length) return
			const pickedUri = result.assets[0].uri

			if (!pickedUri) {
				toast.error('Невалидный файл')
				return
			}

			const { isValid, errorMessage } = validateFile(pickedUri, postImages.length) // + existingImages.length

			if (!isValid) {
				toast.error(errorMessage || 'Файл не прошёл проверку')
				return
			}

			setPostImages((prev) => [...prev, pickedUri])
		} catch {
			toast.error('Ошибка при загрузке изображения')
		}
	}

	return (
		<Page>
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
			<ScrollView>
				<View>
					<Text className="text-white">Test</Text>
				</View>
				{postImages.map((uri, index) => (
					<View key={uri} className="w-1/2 px-[7.5px] relative">
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
						<View className="absolute right-[12px] top-[12px] rounded-full w-[28px] h-[28px] bg-black/40 items-center justify-center">
							<CloseCross handleClose={() => handleDeletePostImage(index)} />
						</View>
					</View>
				))}

				<Button variant="white" onPress={() => setIsPhotoModalOpen(true)}>
					Добавить фото
				</Button>
			</ScrollView>
		</Page>
	)
}

export default Results
