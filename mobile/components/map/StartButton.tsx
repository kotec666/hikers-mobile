import { memo, PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Pressable, PressableProps, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

export interface Props extends PropsWithChildren {
	className?: string
}

const StartButton = memo((props: Props & PressableProps) => {
	const { children, className } = props

	console.log('render StartButton')
	return (
		<Pressable
			{...props}
			className={cn('w-[105px] h-[105px] rounded-[33px] bg-white flex items-center justify-center', className)}
		>
			<Text style={{ fontFamily: fontFamily.bold }} className="text-base">
				{children}
			</Text>
		</Pressable>
	)
})

StartButton.displayName = 'StartButton'

export default StartButton
