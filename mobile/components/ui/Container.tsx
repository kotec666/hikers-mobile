import { PropsWithChildren } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { cn } from '@/helpers/cn'

export interface Props extends PropsWithChildren {
	className?: string
	style?: StyleProp<ViewStyle>
}

export function Container({ children, className, style }: Props) {
	return (
		<View className={cn('px-[16px]', className)} style={style}>
			{children}
		</View>
	)
}
