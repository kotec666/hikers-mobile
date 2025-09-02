import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import React from 'react'
import { cn } from '@/helpers/cn'

export interface IProps {
	avatar: boolean
	className?: string
	style?: StyleProp<ViewStyle | ImageStyle>
}

export function UserAvatar(props: IProps) {
	if (props.avatar) {
		return (
			<Image
				source={require('@/assets/images/carousel/carousel-2.webp')}
				className={cn('h-[50px] w-[50px] rounded-full', props.className)}
				style={props.style as StyleProp<ImageStyle>}
			/>
		)
	}
	return (
		<View
			className={cn('h-[50px] w-[50px] justify-center items-center bg-blue-98 rounded-full', props.className)}
			style={props.style as StyleProp<ViewStyle>}
		>
			<PeopleSvg />
		</View>
	)
}
