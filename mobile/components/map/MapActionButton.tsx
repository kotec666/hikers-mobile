import React, { memo, PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Platform, Pressable, PressableProps, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

export interface Props extends PropsWithChildren {
	className?: string
}

const MapActionButton = memo((props: Props & PressableProps) => {
	const { children, className } = props
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const renderBackground = () => {
		if (Platform.OS !== 'ios') return null

		if (isGlassAvailable) {
			return <GlassView pointerEvents="none" style={StyleSheet.absoluteFill} />
		}

		return <BlurView pointerEvents="none" tint="dark" intensity={10} style={StyleSheet.absoluteFill} />
	}

	return (
		<Pressable
			{...props}
			className={cn(
				'w-[58px] h-[58px] rounded-[18px] flex items-center bg-black/20 justify-center relative overflow-hidden',
				className
			)}
		>
			{renderBackground()}
			{children}
		</Pressable>
	)
})

MapActionButton.displayName = 'MapActionButton'

export default MapActionButton
