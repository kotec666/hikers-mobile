import { Text, View, Platform } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import React, { memo } from 'react'
import { useRouter } from 'expo-router'
import { cn } from '@/helpers/cn'
import { Motion } from '@legendapp/motion'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

interface IProps {
	className?: string
	returnCallback?: () => void
	children: string
}

export const BackButton = memo(({ onPress }: { onPress: () => void }) => {
	const isIos = Platform.OS === 'ios'
	const isGlassAvailable = isIos && isLiquidGlassAvailable()

	const buttonContent = (
		<Motion.View
			className={cn('w-[50px] h-[50px] items-center justify-center', {
				'border border-black-44 rounded-full': !isGlassAvailable,
				'bg-black-0d': !isIos
			})}
			whileTap={{ scale: 0.8 }}
			transition={{
				type: 'spring',
				damping: 20,
				stiffness: 400
			}}
		>
			<ArrowDownSvg style={{ transform: [{ rotate: '90deg' }] }} size={20} />
		</Motion.View>
	)

	const renderWithEffect = (EffectComponent: any, effectProps: any) => (
		<Motion.Pressable onPress={onPress}>
			<EffectComponent style={{ borderRadius: 999, overflow: 'hidden' }} {...effectProps}>
				{buttonContent}
			</EffectComponent>
		</Motion.Pressable>
	)

	if (isGlassAvailable) {
		return renderWithEffect(GlassView, {})
	}

	if (isIos) {
		return renderWithEffect(BlurView, { tint: 'dark', intensity: 10 })
	}

	return <Motion.Pressable onPress={onPress}>{buttonContent}</Motion.Pressable>
})

BackButton.displayName = 'BackButton'

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
		<View className={cn('flex-row items-center gap-x-[16px]', props.className)}>
			<BackButton onPress={handleClickBack} />
			<Text className="text-[20px] text-white" style={{ fontFamily: fontFamily.bold }}>
				{props.children}
			</Text>
		</View>
	)
})

HeaderBack.displayName = 'HeaderBack'

export default HeaderBack
