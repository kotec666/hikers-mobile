import React from 'react'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import { Pressable, View, StyleSheet } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'

const CloseCross = (props: { handleClose?: () => void }) => {
	return (
		<Pressable onPress={props.handleClose} className="bg-black/20 rounded-full">
			<BlurView
				style={styles.closeButtonBlur}
				blurType="extraDark"
				blurAmount={10}
				reducedTransparencyFallbackColor="transparent"
			>
				<View style={styles.closeButton}>
					<CloseSvg />
				</View>
			</BlurView>
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
