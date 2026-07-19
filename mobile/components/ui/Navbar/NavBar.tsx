import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View, Pressable, Platform } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { RelativePathString, usePathname } from 'expo-router'
import { BlurView } from 'expo-blur'
import { cn } from '@/helpers/cn'
import { useNavBarVisibility } from '@/hooks/useNavBarVisibility'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { isLiquidGlassAvailable } from 'expo-glass-effect'

type AnimatedButtonProps = {
	isActive: boolean
	onPress: () => void
	Icon: React.FC<{ stroke: string }>
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ isActive, onPress, Icon }) => {
	const progress = useSharedValue(isActive ? 1 : 0)

	useEffect(() => {
		progress.value = withTiming(isActive ? 1 : 0, { duration: 250 })
	}, [isActive, progress])

	const animatedStyle = useAnimatedStyle(() => {
		const scale = withTiming(isActive ? 1.1 : 1, { duration: 250 })
		const backgroundColor = interpolateColor(progress.value, [0, 1], ['transparent', Colors.white])

		return {
			transform: [{ scale }],
			backgroundColor
		}
	})

	const stroke = isActive ? 'black' : 'white'

	return (
		<Pressable onPress={onPress} style={{ flex: 1 }}>
			<Animated.View style={[styles.NavBarButton, animatedStyle]}>
				<Icon stroke={stroke} />
			</Animated.View>
		</Pressable>
	)
}

const NavBar = () => {
	const insets = useSafeAreaInsets()
	const { push } = useSafeNavigation()
	const pathname = usePathname()

	const hidden = useNavBarVisibility(['/newTraining'])

	const animatedContainer = useAnimatedStyle(() => ({
		opacity: 1 - hidden.value,
		transform: [{ translateY: hidden.value * 80 }]
	}))

	const getActiveId = () => {
		const found = tabsConfig.find((t) => pathname.startsWith(t.href))
		return found?.id
	}

	const activeId = getActiveId()

	const handlePress = useCallback(
		(href: string) => {
			const isSameRoute = pathname.startsWith(href)

			push({
				pathname: href as RelativePathString,
				params: isSameRoute ? { scrollToTop: Date.now() } : {}
			})
		},
		[pathname, push]
	)

	// Костыль, потому что на странице новой тренировки из-за NativeTabs нельзя перетаскивать BottomSheetResizable
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
	if (isGlassAvailable) {
		return null
	}
	return (
		<Animated.View
			style={[styles.NavBarContainer, animatedContainer, { bottom: insets.bottom }]}
			pointerEvents="box-none"
		>
			<View
				style={styles.NavBarButtonsContainer}
				className={cn('', {
					'bg-black/20': Platform.OS === 'android'
				})}
			>
				{Platform.OS === 'ios' && (
					<BlurView
						tint="dark"
						intensity={10}
						style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: 'transparent' }]}
					/>
				)}
				{tabsConfig.map((tab) => (
					<AnimatedButton
						key={tab.id}
						isActive={activeId === tab.id}
						onPress={() => handlePress(tab.href)}
						Icon={tab.icon}
					/>
				))}
			</View>
		</Animated.View>
	)
}

export default NavBar

const styles = StyleSheet.create({
	NavBarContainer: {
		paddingHorizontal: 16,
		width: '100%',
		// left: '50%',
		// transform: [{ translateX: '-50%' }],
		position: 'absolute',
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1
	},
	NavBarButtonsContainer: {
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		height: 63,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		gap: 15,
		flexDirection: 'row',
		borderRadius: 100,
		padding: 16,
		overflow: 'hidden'
	},
	NavBarButton: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
		borderRadius: 100
	}
})
