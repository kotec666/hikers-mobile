import React, { PropsWithChildren } from 'react'
import { Pressable } from 'react-native'
import { cn } from '@/helpers/cn'

interface IProps extends PropsWithChildren {
	onClickAction?: () => void
	isPressed?: boolean
}

const ActionButton = (props: IProps) => {
	return (
		<Pressable
			onPress={props.onClickAction}
			className={cn('w-[70px] h-[70px] rounded-full items-center justify-center', {
				'bg-black-25': props.isPressed,
				'bg-white': !props.isPressed
			})}
		>
			{props.children}
		</Pressable>
	)
}

export default ActionButton
