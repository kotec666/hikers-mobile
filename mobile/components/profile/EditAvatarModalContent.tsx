import React from 'react'
import {Platform, Text, TouchableOpacity, View} from 'react-native'
import CameraSvg from '@/components/svg/CameraSvg'
import {fontFamily} from '@/constants/Fonts'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import GallerySvg from '@/components/svg/GallerySvg'
import * as ImagePicker from 'expo-image-picker'
import {cn} from "@/helpers/cn";

interface IProps {
    handleClickDeleteAvatar: () => void
    handleCloseModal: () => void
    setNewAvatar: (image: string) => void
}

enum ImagePickMode {
    GALLERY = 'gallery',
    CAMERA = 'camera'
}

const EditAvatarModalContent = (props: IProps) => {
    const uploadImage = async (mode: ImagePickMode) => {
        try {
            let result = {} as ImagePicker.ImagePickerResult

            if (mode === ImagePickMode.GALLERY) {
                await ImagePicker.requestMediaLibraryPermissionsAsync()
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1
                })
            } else {
                await ImagePicker.requestCameraPermissionsAsync()
                result = await ImagePicker.launchCameraAsync({
                    cameraType: ImagePicker.CameraType.front,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1
                })
            }

            if (!result.canceled) {
                // save image
                await saveImage(result.assets[0].uri)
            }
        } catch (e) {
            alert('Ошибка при загрузке изображения: ' + e.message) // @TODO
            props.handleCloseModal()
        }
    }

    const buttons = [
        {
            label: 'Камера',
            icon: <CameraSvg/>,
            onPress: () => uploadImage(ImagePickMode.CAMERA)
        },
        {
            label: 'Галерея',
            icon: <GallerySvg/>,
            onPress: () => uploadImage(ImagePickMode.GALLERY)
        },
        {
            label: 'Удалить',
            icon: <DeleteTrashSvg/>,
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
                <TouchableOpacity
                    key={button.label}
                    onPress={button.onPress}
                    className={cn(`items-center justify-center rounded-[8px] py-[15px] gap-2 w-full flex-1`, {
                        'bg-white/20': Platform.OS !== 'ios',
                        'bg-black': Platform.OS === 'ios',
                    })}
                >
                    {button.icon}
                    <Text
                        className={cn(`text-base`, {
                            'text-gray-ab': Platform.OS !== 'ios',
                            'text-white': Platform.OS === 'ios',
                        })}
                        style={{fontFamily: fontFamily.medium}}
                    >
                        {button.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default EditAvatarModalContent
