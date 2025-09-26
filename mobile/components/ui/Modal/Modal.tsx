import React from 'react'
import { View, Text, StyleSheet, Modal as RNModal, ModalProps, KeyboardAvoidingView, Platform } from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import CloseCross from '@/components/ui/CloseCross'

type PROPS = ModalProps & {
	label?: string
	isOpen: boolean
	withInput?: boolean
	handleClose: () => void
}

const Modal = ({ isOpen, withInput, handleClose, label, children, ...rest }: PROPS) => {
	const content = withInput ? (
		<KeyboardAvoidingView
			className="items-center justify-center flex-1 px-3 bg-black/30"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View className="w-full p-4 border-[1px] border-white/20 rounded-[25px] overflow-hidden">
				<BlurView
					style={StyleSheet.absoluteFill}
					blurType="extraDark"
					blurAmount={10}
					reducedTransparencyFallbackColor="transparent"
				/>
				<View className="flex-row items-center justify-between mb-[20px]">
					<Text className="text-white">{label}</Text>
					<CloseCross handleClose={handleClose} />
				</View>
				{children}
			</View>
		</KeyboardAvoidingView>
	) : (
		<View className="items-center justify-center flex-1 px-3 bg-black/30">
			<View className="w-full p-4 border-[1px] border-white/20 rounded-[25px] overflow-hidden">
				<BlurView
					style={StyleSheet.absoluteFill}
					blurType="extraDark"
					blurAmount={10}
					reducedTransparencyFallbackColor="transparent"
				/>
				<View className="flex-row items-center justify-between mb-[20px]">
					<Text className="text-white">{label}</Text>
					<CloseCross handleClose={handleClose} />
				</View>
				{children}
			</View>
		</View>
	)

	return (
		<RNModal visible={isOpen} transparent animationType="fade" statusBarTranslucent {...rest}>
			{content}
		</RNModal>
	)
}

export default Modal
