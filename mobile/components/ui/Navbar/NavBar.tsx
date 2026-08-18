import React, { useCallback } from 'react'
import { StyleSheet, View, Pressable, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { RelativePathString, usePathname } from 'expo-router'
import { BlurView } from 'expo-blur'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { isLiquidGlassAvailable } from 'expo-glass-effect'

type NavBarButtonProps = {
	isActive: boolean
	onPress: () => void
	Icon: React.FC<{ stroke: string }>
}

const NavBarButton: React.FC<NavBarButtonProps> = ({ isActive, onPress, Icon }) => {
	const stroke = isActive ? 'black' : 'white'

	return (
		<Pressable
			onPress={onPress}
			style={[styles.NavBarButton, isActive && styles.NavBarButtonActive]}
			collapsable={false}
		>
			<Icon stroke={stroke} />
		</Pressable>
	)
}

const NavBar = () => {
	const insets = useSafeAreaInsets()
	const { push } = useSafeNavigation()
	const pathname = usePathname()

	const activeRouteName = tabsConfig.find((tab) => pathname.startsWith(tab.href))?.id
	const shouldHide = activeRouteName === 'newTraining'

	const getActiveId = () => {
		const found = tabsConfig.find((tab) => tab.id === activeRouteName)
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

	// Костыль, потому что на странице новой тренировки из-за NativeTabs нельзя перетаскивать BottomSheetResizable @TODO перепроверить сохраняется ли проблема
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
	if (isGlassAvailable) {
		return null
	}
	if (shouldHide) {
		return null
	}
	return (
		<View style={[styles.NavBarContainer, { bottom: insets.bottom }]} pointerEvents="box-none">
			<View
				style={[
					styles.NavBarButtonsContainer,
					Platform.OS === 'android' ? { backgroundColor: 'rgb(0 0 0 / 0.2)' } : {}
				]}
				// className={cn('', {
				// 	'bg-black/20': Platform.OS === 'android'
				// })}
			>
				{Platform.OS === 'ios' && (
					<BlurView
						tint="dark"
						intensity={10}
						style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: 'transparent' }]}
					/>
				)}
				{tabsConfig.map((tab) => (
					<NavBarButton
						key={tab.id}
						isActive={activeId === tab.id}
						onPress={() => handlePress(tab.href)}
						Icon={tab.icon}
					/>
				))}
			</View>
		</View>
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
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 5,
		borderRadius: 100,
		overflow: 'hidden'
	},
	NavBarButtonActive: {
		backgroundColor: Colors.white
	}
})
