import React, { memo } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import type { RenderOverlayProps } from '@quidone/react-native-wheel-picker'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const Overlay = ({ itemHeight }: RenderOverlayProps) => {
	return (
		<View style={styles.overlayContainer} pointerEvents="none">
			<View
				className="w-full"
				style={[
					styles.selection,
					{
						height: itemHeight / 1.3
					}
				]}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	overlayContainer: {
		...StyleSheet.absoluteFill,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 16
	},
	selection: {
		backgroundColor: 'rgba(0,0,0,0.2)',
		borderRadius: 12,
		borderWidth: 1,
		width: SCREEN_WIDTH / 1.1,
		borderColor: 'rgba(255,255,255,0.08)'
	}
})

export default memo(Overlay)
