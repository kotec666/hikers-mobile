import React, { ReactNode } from 'react'
import { Pressable, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

type Props = {
	title?: string
	onPress?: () => void
	closeMenu?: () => void
	disabled?: boolean
	children?: ReactNode
}

export default function PopupMenuItem({ title, onPress, closeMenu, children, disabled }: Props) {
	return (
		<Pressable
			onPress={() => {
				onPress?.()
				closeMenu?.()
			}}
			disabled={disabled}
		>
			{children || (
				<Text
					className="text-sm text-white text-nowrap whitespace-nowrap"
					style={{ fontFamily: fontFamily.regular }}
				>
					{title}
				</Text>
			)}
		</Pressable>
	)
}
