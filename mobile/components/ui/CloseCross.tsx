import React from 'react'
import { Pressable, View, StyleSheet } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'
import {BlurView} from "expo-blur";

const CloseCross = (props: { handleClose?: () => void }) => {
	return (
		<Pressable onPress={props.handleClose} className="bg-black/20 rounded-full">
			<BlurView
				style={styles.closeButtonBlur}
                tint="dark"
                intensity={10}
                experimentalBlurMethod="dimezisBlurView"
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
