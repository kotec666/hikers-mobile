import React, { PropsWithChildren } from 'react'
import { View, Text, Pressable, Dimensions } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'

const { width } = Dimensions.get('screen')

interface IProps extends PropsWithChildren {
	label?: string
	open: boolean
	handleClose: () => void
}

const Modal = (props: IProps) => {
	if (!props.open) return null
	return (
		<View
			className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-black/20 p-[16px] rounded-[25px]"
			style={{ zIndex: 2, width: width - 32 }}
		>
			<View className="flex-row justify-between">
				<Text className="text-white">{props.label}</Text>
				<Pressable onPress={props.handleClose}>
					<View className="items-center justify-center w-[28px] h-[28px] rounded-full bg-black/20">
						<CloseSvg />
					</View>
				</Pressable>
			</View>
			{props.children}
		</View>
	)
}

export default Modal
