import React, { PropsWithChildren } from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {BlurView} from "expo-blur";

const Popup = (props: PropsWithChildren) => {
	const insets = useSafeAreaInsets()
	return (
		<View style={[styles.container, { top: insets.top + 35 }]}>
			<BlurView
				style={styles.blurView}
                tint="dark"
                intensity={15}
                experimentalBlurMethod="dimezisBlurView"
			>
				<View style={styles.content}>{props.children}</View>
			</BlurView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		right: 0,
		zIndex: 5,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
		minWidth: 150
	},
	blurView: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		backgroundColor: 'transparent'
	},
	content: {
		padding: 20,
		gap: 15
	}
})

export default Popup
