import { Pressable, Text, View } from 'react-native'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import { fontFamily } from '@/constants/Fonts'
import { memo, PropsWithChildren } from 'react'
import { useRouter } from 'expo-router'
import { cn } from '@/helpers/cn'

interface IProps extends PropsWithChildren {
	className?: string
	returnCallback?: () => void
}

const HeaderBack = memo((props: IProps) => {
	const router = useRouter()

	const handleClickBack = () => {
		if (props.returnCallback) {
			props.returnCallback?.()
		} else {
			router.back()
		}
	}

	console.log('render HeaderBack')
	return (
		<View className={cn('flex-row gap-x-[16px]', props.className)}>
			<Pressable onPress={handleClickBack}>
				<ArrowBackSvg />
			</Pressable>
			<Text className="text-[20px] text-white" style={{ fontFamily: fontFamily.bold }}>
				{props.children}
			</Text>
		</View>
	)
})

HeaderBack.displayName = 'HeaderBack'

export default HeaderBack
