import { PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Pressable, PressableProps } from 'react-native'

export interface Props extends PropsWithChildren {
	className?: string
}

export function MapActionButton(props: Props & PressableProps) {
	const { children, className } = props

	return (
		<Pressable
			{...props}
			className={cn('w-[58px] h-[58px] rounded-[18px] bg-black/20 flex items-center justify-center ', className)}
		>
			{children}
		</Pressable>
	)
}
