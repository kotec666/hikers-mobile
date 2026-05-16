import React, { PropsWithChildren } from 'react'
import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Portal from '@/components/Portal/Portal'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

interface PopupProps {
	onClose: () => void
}

const Popup = ({ children, onClose }: PropsWithChildren<PopupProps>) => {
	const insets = useSafeAreaInsets()
	const blurTargetRef = useBlurContext()
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const renderContent = () => {
		if (isGlassAvailable) {
			return (
				<GlassView style={styles.glassView}>
					<View style={styles.content}>{children}</View>
				</GlassView>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView style={styles.blurView} tint="dark" intensity={15}>
					<View style={styles.content}>{children}</View>
				</BlurView>
			)
		}

		return (
			<BlurView
				style={styles.blurView}
				blurTarget={blurTargetRef}
				intensity={25}
				tint="dark"
				blurMethod="dimezisBlurView"
			>
				<View style={styles.content}>{children}</View>
			</BlurView>
		)
	}

	return (
		<Portal>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable
					style={[
						styles.container,
						{ top: insets.top + 35, right: 16 },
						!isGlassAvailable && { borderWidth: 1 }
					]}
					onPress={(e) => e.stopPropagation()}
				>
					{renderContent()}
				</Pressable>
			</Pressable>
		</Portal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFill
	},
	container: {
		position: 'absolute',
		right: 0,
		zIndex: 5,
		borderRadius: 25,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		overflow: 'hidden',
		minWidth: 150
	},
	glassView: {
		width: '100%',
		height: '100%',
		borderRadius: 25,
		overflow: 'hidden'
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
