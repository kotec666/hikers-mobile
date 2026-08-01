import React, { ReactNode } from 'react'
import { Pressable, View, StyleSheet, Platform } from 'react-native'
import CloseSvg from '@/components/svg/CloseSvg'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

const RoundedMiniButton = (props: { onPress?: () => void; blurDisabled?: boolean; children?: ReactNode }) => {
	const blurTargetRef = useBlurContext()
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const renderContent = () => {
		if (props.blurDisabled) {
			return (
				<View style={[styles.fallback]}>
					<View style={styles.closeButton}>{props.children || <CloseSvg />}</View>
				</View>
			)
		}

		if (isGlassAvailable) {
			return (
				<GlassView colorScheme="dark" style={styles.glassView}>
					<View style={styles.closeButton}>{props.children || <CloseSvg />}</View>
				</GlassView>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView style={styles.blurView} tint="light" intensity={10}>
					<View style={styles.closeButton}>{props.children || <CloseSvg />}</View>
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
				<View style={styles.closeButton}>{props.children || <CloseSvg />}</View>
			</BlurView>
		)
	}

	return <Pressable onPress={props.onPress}>{renderContent()}</Pressable>
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

export default RoundedMiniButton
