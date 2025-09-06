import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
	interpolateColor
} from 'react-native-reanimated'
import NavBarPostsSvg from '@/components/svg/NavBarPostsSvg'
import NavBarMapSvg from '@/components/svg/NavBarMapSvg'
import NavBarAccountSvg from '@/components/svg/NavBarAccountSvg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { RelativePathString, useRouter } from 'expo-router'

type AnimatedButtonProps = {
	isActive: boolean
	onPress: () => void
	Icon: React.FC<{ stroke: string }>
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ isActive, onPress, Icon }) => {
	const progress = useSharedValue(isActive ? 1 : 0)

	useEffect(() => {
		progress.value = withTiming(isActive ? 1 : 0, { duration: 250 })
	}, [isActive])

	const animatedStyle = useAnimatedStyle(() => {
		const scale = withSpring(isActive ? 1.08 : 1, { damping: 8, stiffness: 150 })

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
	const [activeId, setActiveId] = useState<number>(1)
	const router = useRouter()

	const links: { id: number; Icon: React.FC<{ stroke: string }>; href: string }[] = [
		{ id: 1, Icon: NavBarPostsSvg, href: '/' },
		{ id: 2, Icon: NavBarMapSvg, href: '/map' },
		{ id: 3, Icon: NavBarAccountSvg, href: '/profile' }
	]

	return (
		<View style={[styles.NavBarContainer, { bottom: insets.bottom }]} pointerEvents="box-none">
			<View style={styles.NavBarButtonsContainer}>
				{links.map((link) => (
					<AnimatedButton
						key={link.id}
						isActive={activeId === link.id}
						onPress={() => {
							setActiveId(link.id)
							router.push(link.href as RelativePathString)
						}}
						Icon={link.Icon}
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
		left: '50%',
		transform: [{ translateX: '-50%' }],
		position: 'absolute',
		height: 100,
		alignItems: 'center',
		justifyContent: 'center'
	},
	NavBarButtonsContainer: {
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: Colors.white,
		gap: 15,
		flexDirection: 'row',
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 100,
		padding: 16
	},
	NavBarButton: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
		borderRadius: 100
	}
})
