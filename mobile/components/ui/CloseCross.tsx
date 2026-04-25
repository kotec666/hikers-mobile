import React from 'react'
import { Pressable, View, StyleSheet, Platform } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

const CloseCross = (props: { handleClose?: () => void; blurDisabled?: boolean }) => {
	const blurTargetRef = useBlurContext()
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const renderContent = () => {
		if (props.blurDisabled) {
			return (
				<View style={[styles.fallback]}>
					<View style={styles.closeButton}>
						<CloseSvg />
					</View>
				</View>
			)
		}

		if (isGlassAvailable) {
			return (
				<GlassView tintColor="dark" style={styles.glassView}>
					<View style={styles.closeButton}>
						<CloseSvg />
					</View>
				</GlassView>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView style={styles.blurView} tint="light" intensity={10}>
					<View style={styles.closeButton}>
						<CloseSvg />
					</View>
				</BlurView>
			)
		}

		return (
			<BlurView
				style={styles.blurView}
				tint="dark"
				intensity={90}
				blurTarget={blurTargetRef}
				blurMethod="dimezisBlurView"
			>
				<View style={styles.closeButton}>
					<CloseSvg />
				</View>
			</BlurView>
		)
	}

	return <Pressable onPress={props.handleClose}>{renderContent()}</Pressable>
}

const SIZE = 28

const styles = StyleSheet.create({
	glassView: {
		width: SIZE,
		height: SIZE,
		borderRadius: SIZE / 2,
		overflow: 'hidden'
	},
	blurView: {
		width: SIZE,
		height: SIZE,
		borderRadius: SIZE / 2,
		overflow: 'hidden',
		backgroundColor: 'transparent'
	},
	fallback: {
		width: SIZE,
		height: SIZE,
		borderRadius: SIZE / 2,
		backgroundColor: 'rgba(0,0,0,0.25)',
		overflow: 'hidden'
	},
	closeButton: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	}
})

export default CloseCross
