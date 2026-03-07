import { Text, View } from 'react-native'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import { fontFamily } from '@/constants/Fonts'
import { memo } from 'react'
import { useRouter } from 'expo-router'
import { cn } from '@/helpers/cn'
import { Motion } from '@legendapp/motion'

interface IProps {
	className?: string
	returnCallback?: () => void
	children: string
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

	return (
		<View className={cn('flex-row gap-x-[16px]', props.className)}>
			<Motion.Pressable onPress={handleClickBack}>
				<Motion.View
					whileTap={{ scale: 0.8 }}
					transition={{
						type: 'spring',
						damping: 20,
						stiffness: 400
					}}
				>
					<ArrowBackSvg />
				</Motion.View>
			</Motion.Pressable>
			<Text className="text-[20px] text-white" style={{ fontFamily: fontFamily.bold }}>
				{props.children}
			</Text>
		</View>
	)
})

HeaderBack.displayName = 'HeaderBack'

export default HeaderBack
