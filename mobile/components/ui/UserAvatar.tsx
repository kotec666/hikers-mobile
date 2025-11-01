import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import React from 'react'
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
	if (typeof props.avatar === 'string' && !props.avatar.includes('undefined') && !props.avatar.includes('null')) {
		return (
			<View
				className={cn('relative rounded-full', {
					'border-[1px] border-white/20': props.bordered // @TODO возможно border в постах автор отличается от профиля аватар
				})}
			>
				<Image
					source={{ uri: props.avatar }}
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
			className={cn('relative h-[50px] w-[50px] justify-center items-center bg-blue-98', props.className)}
			style={[
				props.style as StyleProp<ViewStyle>,
				{ borderRadius: 999 },
				props.bordered && { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.4)' }
			]}
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
