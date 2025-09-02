import { Pressable, ViewProps } from 'react-native'
import { cn } from '@/helpers/cn'
import CheckmarkSvg from '@/components/svg/CheckmarkSvg'

interface Props extends ViewProps {
	onValueChange: (value: boolean) => void
	value: boolean
}

export default function Checkbox(props: Props) {
	return (
		<Pressable
			className={cn('items-center justify-center border-2 border-white rounded-[4px] w-[19px] h-[19px]', {
				'bg-white': props.value
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
