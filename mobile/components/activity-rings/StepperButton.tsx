import React, { ReactNode } from 'react'
import { Pressable } from 'react-native'

interface IProps {
	onPress?: () => void
	onLongPress?: () => void
	onPressOut?: () => void
	size?: number
	children: ReactNode
}

const StepperButton = ({ onPress, onLongPress, onPressOut, children, size = 30 }: IProps) => {
	return (
		<Pressable
			onPress={onPress}
			onLongPress={onLongPress}
			onPressOut={onPressOut}
			delayLongPress={300}
			style={{
				width: size,
				height: size
			}}
			className="bg-green-main rounded-full items-center justify-center"
		>
			{children}
		</Pressable>
	)
}

export default StepperButton
