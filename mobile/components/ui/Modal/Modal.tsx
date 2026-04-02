import React from 'react'
import { View, Text, StyleSheet, Modal as RNModal, ModalProps, KeyboardAvoidingView, Platform } from 'react-native'
import CloseCross from '@/components/ui/CloseCross'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'

type PROPS = ModalProps & {
	label?: string
	labelSize?: number
	isOpen: boolean
	withInput?: boolean
	blurDisabled?: boolean
	handleClose: () => void
}

const Modal = ({ isOpen, withInput, handleClose, label, labelSize, children, blurDisabled, ...rest }: PROPS) => {
	const blurTargetRef = useBlurContext()
	const content = withInput ? (
		<KeyboardAvoidingView
			className="items-center justify-center flex-1 px-3 bg-black/30"
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<View
				className="w-full p-4 border-[1px] border-white/20 rounded-[25px] overflow-hidden"
				style={[{}, blurDisabled && { backgroundColor: 'black' }]}
			>
				{!blurDisabled && (
					<BlurView
						tint="dark"
						style={StyleSheet.absoluteFill}
						blurTarget={blurTargetRef}
						intensity={Platform.OS === 'ios' ? 10 : 25}
						blurMethod={Platform.OS === 'ios' ? undefined : 'dimezisBlurView'}
					/>
				)}
				<View className="flex-row items-center justify-between mb-[20px]">
					<Text className="text-white" style={{ fontSize: labelSize || 12 }}>
						{label}
					</Text>
					<CloseCross handleClose={handleClose} />
				</View>
				{children}
			</View>
		</KeyboardAvoidingView>
	) : (
		<View className="items-center justify-center flex-1 px-3 bg-black/30">
			<View
				className="w-full p-4 border-[1px] border-white/20 rounded-[25px] overflow-hidden"
				style={[{}, blurDisabled && { backgroundColor: 'black' }]}
			>
				{!blurDisabled && (
					<BlurView
						tint="dark"
						style={StyleSheet.absoluteFill}
						blurTarget={blurTargetRef}
						intensity={Platform.OS === 'ios' ? 10 : 25}
						blurMethod={Platform.OS === 'ios' ? undefined : 'dimezisBlurView'}
					/>
				)}
				<View className="flex-row items-center justify-between mb-[20px]">
					<Text className="text-white" style={{ fontSize: labelSize || 12 }}>
						{label}
					</Text>
					<CloseCross blurDisabled={blurDisabled} handleClose={handleClose} />
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
