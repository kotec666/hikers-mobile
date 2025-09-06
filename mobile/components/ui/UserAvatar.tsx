import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import React from 'react'
import { cn } from '@/helpers/cn'
import PenSvg from '@/components/svg/PenSvg'

export interface IProps {
	avatar: boolean
	className?: string
	style?: StyleProp<ViewStyle | ImageStyle>
	iconSize?: { width: number; height: number }
	isEditMode?: boolean
}

export function UserAvatar(props: IProps) {
	if (props.avatar) {
		return (
			<View className="relative">
				<Image
					source={require('@/assets/images/carousel/carousel-2.webp')}
					className={cn('h-[50px] w-[50px] rounded-full', props.className)}
					style={props.style as StyleProp<ImageStyle>}
				/>
				{props.isEditMode && (
					<View
						className="absolute right-0 bg-white rounded-full w-[25px] h-[25px] items-center justify-center"
						style={{ bottom: 10 }}
					>
						<PenSvg />
					</View>
				)}
			</View>
		)
	}
	return (
		<View
			className={cn(
				'relative h-[50px] w-[50px] justify-center items-center bg-blue-98 rounded-full',
				props.className
			)}
			style={props.style as StyleProp<ViewStyle>}
		>
			<PeopleSvg height={props?.iconSize?.height} width={props?.iconSize?.width} />
			{props.isEditMode && (
				<View
					className="absolute right-0 bg-white rounded-full w-[25px] h-[25px] items-center justify-center"
					style={{ bottom: 10 }}
				>
					<PenSvg />
				</View>
			)}
		</View>
	)
}
