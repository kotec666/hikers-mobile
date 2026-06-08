import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, LayoutRectangle, Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Placement = 'top' | 'bottom' | 'left' | 'right'

type PopupMenuProps = {
	trigger: (props: { open: () => void; close: () => void }) => ReactNode
	children: ReactNode
	menuWidth?: number
	menuHeight?: number
	offset?: number
}

const SCREEN = Dimensions.get('window')

export default function PopupMenu({
	trigger,
	children,
	menuWidth = 220,
	menuHeight = 200,
	offset = 8
}: PopupMenuProps) {
	const triggerRef = useRef<View>(null)
	const blurTargetRef = useBlurContext()
	const insets = useSafeAreaInsets()

	const [visible, setVisible] = useState(false)
	const [position, setPosition] = useState({
		top: 0,
		left: 0
	})

	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const close = useCallback(() => {
		setVisible(false)
	}, [])

	const calculatePlacement = useCallback(
		(layout: LayoutRectangle): Placement => {
			const spaceBottom = SCREEN.height - (layout.y + layout.height)

			const spaceTop = layout.y

			const spaceRight = SCREEN.width - (layout.x + layout.width)

			if (spaceBottom >= menuHeight) {
				return 'bottom'
			}

			if (spaceTop >= menuHeight) {
				return 'top'
			}

			if (spaceRight >= menuWidth) {
				return 'right'
			}

			return 'left'
		},
		[menuHeight, menuWidth]
	)

	const calculatePosition = useCallback(
		(layout: LayoutRectangle, placement: Placement) => {
			const padding = 12

			switch (placement) {
				case 'bottom':
					return {
						top: layout.y + layout.height + offset,

						left: Math.max(padding, Math.min(layout.x, SCREEN.width - menuWidth - padding))
					}

				case 'top':
					return {
						top: layout.y - menuHeight - offset,

						left: Math.max(padding, Math.min(layout.x, SCREEN.width - menuWidth - padding))
					}

				case 'right':
					return {
						top: Math.max(padding, Math.min(layout.y, SCREEN.height - menuHeight - padding)),

						left: layout.x + layout.width + offset
					}

				case 'left':
					return {
						top: Math.max(padding, Math.min(layout.y, SCREEN.height - menuHeight - padding)),

						left: layout.x - menuWidth - offset
					}
			}
		},
		[menuHeight, menuWidth, offset]
	)

	const open = useCallback(() => {
		if (!triggerRef.current) {
			return
		}

		triggerRef.current.measureInWindow((x, y, width, height) => {
			const layout: LayoutRectangle = {
				x,
				y: y - insets.top,
				width,
				height
			}

			const placement = calculatePlacement(layout)

			const nextPosition = calculatePosition(layout, placement)

			setPosition(nextPosition)

			setVisible(true)
		})
	}, [calculatePlacement, calculatePosition, insets.top])

	useEffect(() => {
		const subscription = Dimensions.addEventListener('change', () => {
			if (visible) {
				close()
			}
		})

		return () => {
			subscription.remove()
		}
	}, [visible, close])

	const renderContent = () => {
		const content = (
			<View style={styles.content}>
				{React.Children.map(children, (child) => {
					if (!React.isValidElement(child)) {
						return child
					}

					return React.cloneElement(child as React.ReactElement<any>, {
						closeMenu: close
					})
				})}
			</View>
		)

		if (isGlassAvailable) {
			return (
				<GlassView colorScheme="dark" style={styles.glassView}>
					{content}
				</GlassView>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView style={styles.blurView} tint="dark" intensity={15}>
					{content}
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
				{content}
			</BlurView>
		)
	}

	return (
		<>
			<View ref={triggerRef} collapsable={false}>
				{trigger({
					open,
					close
				})}
			</View>

			<Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
				<Pressable style={styles.overlay} onPress={close}>
					<Pressable onPress={() => {}}>
						<View
							style={[
								styles.container,
								{
									width: menuWidth,
									maxHeight: menuHeight,
									top: position.top,
									left: position.left
								},
								!isGlassAvailable && styles.border
							]}
						>
							{renderContent()}
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	)
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFill
	},
	container: {
		position: 'absolute',
		zIndex: 1000,
		borderRadius: 25,
		overflow: 'hidden',
		minWidth: 150
	},
	border: {
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)'
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
