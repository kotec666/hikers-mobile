import { Pressable, ViewProps } from 'react-native'
import { cn } from '@/helpers/cn'
import CheckmarkSvg from '@/components/svg/CheckmarkSvg'
import { Motion } from '@legendapp/motion'

interface Props extends ViewProps {
	onValueChange: (value: boolean) => void
	value?: boolean
	error: boolean
}

export default function Checkbox({ onValueChange, value, error }: Props) {
	const getBackgroundColor = () => {
		if (error) return '#00000000' // прозрачный фон при ошибке
		if (value) return '#ffffff' // белый фон, когда выбран
		return '#00000000' // прозрачный фон
	}

	return (
		<Pressable
			onPress={() => {
				onValueChange(!value)
			}}
		>
			<Motion.View
				animate={{
					backgroundColor: getBackgroundColor()
				}}
				transition={{ type: 'timing', duration: 300 }}
				className={cn('items-center justify-center border-2 rounded-[4px] w-[19px] h-[19px]', {
					'border-red-500': error,
					'border-white': !error
				})}
			>
				{value && <CheckmarkSvg />}
			</Motion.View>
		</Pressable>
	)
}
