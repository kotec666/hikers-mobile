import React from 'react'
import { View, Text, StyleSheet, ModalProps, Platform } from 'react-native'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { BlurView } from 'expo-blur'
import RoundedMiniButton from '@/components/ui/RoundedMiniButton'
import { DEFAULT_PADDING_TOP } from '@/constants/Variables'

type PROPS = ModalProps & {
	label?: string
	labelSize?: number
	isOpen: boolean
	withInput?: boolean
	blurDisabled?: boolean
	handleClose: () => void
}

const Modal = ({ isOpen, withInput, handleClose, label, labelSize, children, blurDisabled }: PROPS) => {
	const blurTargetRef = useBlurContext()
	const insets = useSafeAreaInsets()
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const renderContent = () => {
		if (blurDisabled) {
			return (
				<View style={[styles.inner, { backgroundColor: 'black' }]}>
					{header()}
					{children}
				</View>
			)
		}

		if (isGlassAvailable) {
			return (
				<GlassView colorScheme="dark" style={styles.glassView}>
					<View style={styles.inner}>
						{header()}
						{children}
					</View>
				</GlassView>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView style={styles.blurView} tint="dark" intensity={10}>
					<View style={styles.inner}>
						{header()}
						{children}
					</View>
				</BlurView>
			)
		}

		return (
			<BlurView
				style={styles.blurView}
				tint="dark"
				intensity={25}
				blurTarget={blurTargetRef}
				blurMethod="dimezisBlurView"
			>
				<View style={styles.inner}>
					{header()}
					{children}
				</View>
			</BlurView>
		)
	}

	const header = () => (
		<View style={styles.header}>
			<Text style={[styles.label, { fontSize: labelSize || 12 }]}>{label}</Text>
			<RoundedMiniButton blurDisabled={blurDisabled} onPress={handleClose} />
		</View>
	)

	const Wrapper = withInput ? KeyboardStickyView : View

	if (!isOpen) return null

	return (
		<Animated.View
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(150)}
			style={[
				StyleSheet.absoluteFill,
				styles.topLayer,
				{ top: -(insets.top + DEFAULT_PADDING_TOP), bottom: -insets.bottom }
			]}
		>
			<Wrapper
				style={styles.overlay}
				{...(withInput && {
					behavior: Platform.OS === 'ios' ? 'padding' : 'height'
				})}
			>
				<View style={styles.container}>{renderContent()}</View>
			</Wrapper>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	topLayer: {
		zIndex: 999,
		elevation: 999
	},
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 12,
		backgroundColor: 'rgba(0,0,0,0.3)'
	},
	container: {
		width: '100%',
		borderRadius: 25,
		borderColor: 'rgba(255,255,255,0.2)',
		overflow: 'hidden'
	},
	glassView: {
		width: '100%',
		borderRadius: 25,
		overflow: 'hidden'
	},
	blurView: {
		width: '100%'
	},
	inner: {
		padding: 16
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20
	},
	label: {
		color: '#fff',
		flex: 1,
		marginRight: 10
	}
})

export default Modal
