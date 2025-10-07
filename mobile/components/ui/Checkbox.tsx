import { Pressable, ViewProps } from 'react-native'
import { cn } from '@/helpers/cn'
import CheckmarkSvg from '@/components/svg/CheckmarkSvg'

interface Props extends ViewProps {
	onValueChange: (value: boolean) => void
	value?: boolean
	error: boolean
}

export default function Checkbox(props: Props) {
	return (
		<Pressable
			className={cn('items-center justify-center border-2 rounded-[4px] w-[19px] h-[19px]', {
				'bg-white': props.value,
				'border-red-500': props.error,
				'border-white': !props.error
			})}
			onPress={() => {
				props.onValueChange(!props.value)
			}}
			{...props}
		>
			{props.value && <CheckmarkSvg />}
		</Pressable>
	)
}
