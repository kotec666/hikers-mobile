import React, { PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Pressable, PressableProps } from 'react-native'
import {BlurView} from "expo-blur";

export interface Props extends PropsWithChildren {
	className?: string
}

export function MapActionButton(props: Props & PressableProps) {
	const { children, className } = props

	return (
		<Pressable
			{...props}
			className={cn(
				'w-[58px] h-[58px] rounded-[18px] flex items-center bg-black/20 justify-center relative overflow-hidden',
				className
			)}
		>
			<BlurView
                tint="dark"
				intensity={10}
                experimentalBlurMethod="dimezisBlurView"
				style={[
					{
						width: 100,
						height: 100,
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
