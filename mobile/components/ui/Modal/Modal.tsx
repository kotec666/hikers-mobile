import React, { PropsWithChildren } from 'react'
import { View, Text, Dimensions, StyleSheet } from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import CloseCross from '@/components/ui/CloseCross'

const { width } = Dimensions.get('screen')

interface IProps extends PropsWithChildren {
	label?: string
	open: boolean
	handleClose: () => void
}

const Modal = (props: IProps) => {
	if (!props.open) return null
	return (
		<View style={styles.container}>
			<BlurView
				style={styles.blurBackground}
				blurType="dark"
				blurAmount={10}
				reducedTransparencyFallbackColor="transparent"
			/>

			<View style={styles.modalContent}>
				<View className="flex-row justify-between">
					<Text className="text-white">{props.label}</Text>
					<CloseCross handleClose={props.handleClose} />
				</View>
				{props.children}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: [{ translateX: -((width - 32) / 2) }, { translateY: -((width - 32) / 4) }],
		width: width - 32,
		zIndex: 2,
		borderRadius: 25,
		overflow: 'hidden',
		backgroundColor: 'rgba(0,0,0,0.2)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)'
	},
	blurBackground: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		overflow: 'hidden',
		backgroundColor: 'transparent'
	},
	modalContent: {
		padding: 16
	}
})

export default Modal
