import React, { PropsWithChildren } from 'react'
import { View, StyleSheet, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Portal from '@/components/Portal/Portal'

interface PopupProps {
	onClose: () => void
}

const Popup = ({ children, onClose }: PropsWithChildren<PopupProps>) => {
	const insets = useSafeAreaInsets()
	return (
		<Portal>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable style={[styles.container, { top: insets.top + 35 }]} onPress={(e) => e.stopPropagation()}>
					{Platform.OS === 'ios' ? (
						<BlurView style={styles.blurView} tint="dark" intensity={15}>
							<View style={styles.content}>{children}</View>
						</BlurView>
					) : (
						<View style={styles.content} className="bg-black">
							{children}
						</View>
					)}
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
