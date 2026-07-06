import { Image, ImageStyle } from 'expo-image'
import { StyleProp, View, ViewStyle } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import React, { useEffect, useState } from 'react'
import { cn } from '@/helpers/cn'
import PenSvg from '@/components/svg/PenSvg'

export interface IProps {
	avatar?: string | null
	className?: string
	style?: StyleProp<ViewStyle | ImageStyle>
	iconSize?: { width: number; height: number }
	isEditMode?: boolean
	bordered?: boolean
}

export function UserAvatar(props: IProps) {
	const [imageError, setImageError] = useState(false)

	useEffect(() => {
		setImageError(false)
	}, [props.avatar])

	if (
		typeof props.avatar === 'string' &&
		!props.avatar.includes('undefined') &&
		!props.avatar.includes('null') &&
		!imageError
	) {
		return (
			<View className="relative self-start">
				<View
					className={cn('relative h-[50px] w-[50px] rounded-full', props.className, {
						'border-[1px] border-white/20': props.bordered
					})}
					style={[
						props.style as StyleProp<ViewStyle>,
						{ borderRadius: 999, overflow: 'hidden' },
						props.bordered && { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' }
					]}
				>
					<Image
						source={{ uri: props.avatar }}
						style={{ width: '100%', height: '100%' }}
						contentFit="cover"
						onError={() => setImageError(true)}
					/>
				</View>
				{props.isEditMode && (
					<View
						className="absolute right-0 bg-white rounded-full w-[25px] h-[25px] items-center justify-center overflow-hidden"
						style={{ bottom: 10 }}
					>
						<PenSvg />
					</View>
				)}
			</View>
		)
	}
	return (
		<View className="relative self-start">
			<View
				className={cn(
					'relative h-[50px] w-[50px] rounded-full justify-center items-center bg-blue-98',
					props.className
				)}
				style={[
					props.style as StyleProp<ViewStyle>,
					{ borderRadius: 999, overflow: 'hidden' },
					props.bordered && { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' }
				]}
			>
				<PeopleSvg height={props?.iconSize?.height} width={props?.iconSize?.width} />
			</View>
			{props.isEditMode && (
				<View
					className="absolute right-0 bg-white rounded-full w-[25px] h-[25px] items-center justify-center overflow-hidden"
					style={{ bottom: 10 }}
				>
					<PenSvg />
				</View>
			)}
		</View>
	)
}
