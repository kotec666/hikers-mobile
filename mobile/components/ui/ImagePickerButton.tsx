import React from 'react'
import { cn } from '@/helpers/cn'
import { Platform, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { isLiquidGlassAvailable } from 'expo-glass-effect'

const ImagePickerButton = (props: { onPress: () => void; icon: React.JSX.Element; title: string }) => {
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
	return (
		<TouchableOpacity
			onPress={props.onPress}
			className={cn(`items-center justify-center rounded-[8px] py-[15px] gap-2 w-full flex-1`, {
				'bg-black': Platform.OS === 'ios' && !isGlassAvailable,
				'bg-white/20': isGlassAvailable || Platform.OS !== 'ios'
			})}
		>
			{props.icon}
			<Text
				className={cn(`text-base`, {
					'text-gray-ab': Platform.OS !== 'ios',
					'text-white': Platform.OS === 'ios'
				})}
				style={{ fontFamily: fontFamily.medium }}
			>
				{props.title}
			</Text>
		</TouchableOpacity>
	)
}

export default ImagePickerButton
