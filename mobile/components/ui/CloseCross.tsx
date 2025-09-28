import React from 'react'
import { Pressable, View, StyleSheet, Platform } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'
import { BlurView } from 'expo-blur'

const CloseCross = (props: { handleClose?: () => void }) => {
	return (
		<Pressable onPress={props.handleClose} className="bg-black/20 rounded-full">
			{Platform.OS === 'ios' ? (
				<BlurView style={styles.closeButtonBlur} tint="dark" intensity={10}>
					<View style={styles.closeButton}>
						<CloseSvg />
					</View>
				</BlurView>
			) : (
				<View className="w-[28px] h-[28px] rounded-full overflow-hidden bg-black-25">
					<View style={styles.closeButton}>
						<CloseSvg />
					</View>
				</View>
			)}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	closeButtonBlur: {
		width: 28,
		height: 28,
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: 'transparent'
	},
	closeButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	}
})

export default CloseCross
