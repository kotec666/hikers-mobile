import React, { PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Pressable, PressableProps, StyleSheet } from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'

export interface Props extends PropsWithChildren {
	className?: string
}

export function MapActionButton(props: Props & PressableProps) {
	const { children, className } = props

	return (
		<Pressable
			{...props}
			className={cn(
				'w-[58px] h-[58px] rounded-[18px] flex items-center justify-center relative overflow-hidden',
				className
			)}
		>
			<BlurView
				reducedTransparencyFallbackColor="transparent"
				blurType="dark"
				blurAmount={10}
				style={[
					StyleSheet.absoluteFill,
					{
						justifyContent: 'center',
						alignItems: 'center',
						overflow: 'hidden',
						backgroundColor: 'transparent'
					}
				]}
			>
				{children}
			</BlurView>
		</Pressable>
	)
}
