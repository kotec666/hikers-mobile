import React from 'react'
import { Motion } from '@legendapp/motion'
import AlertTriangleSvg from '@/components/svg/AlertTriangleSvg'
import { Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import { useToast } from '@/hooks/useToast'
import { requestConfirmEmailCode } from '@/api/auth'
import { createTimer, isRateLimited, TimerType } from '@/store/timerStorage'

const EmailNotConfirmed = ({ isVisible, email }: { isVisible: boolean; email?: string }) => {
	const toast = useToast()
	const { push } = useSafeNavigation()

	const handlePress = async () => {
		if (!email) {
			return toast.error('email не указан')
		}

		const hasActiveTimer = isRateLimited(TimerType.EMAIL_CONFIRMATION, email)

		// уже есть cooldown
		// просто открываем экран

		if (hasActiveTimer) {
			return push(`/mail-confirmation?email=${email}`)
		}

		// cooldown нет
		// отправляем новый код

		await requestConfirmEmailCode()

		createTimer(TimerType.EMAIL_CONFIRMATION, email)

		return push(`/mail-confirmation?email=${email}`)
	}

	if (!isVisible) return null
	return (
		<Motion.Pressable onPress={handlePress}>
			<Motion.View
				className="flex-row items-center gap-[12px] rounded-[14px] bg-black-25 border border-black-44 p-[12px]"
				whileTap={{ scale: 0.9 }}
				transition={{
					type: 'spring',
					damping: 20,
					stiffness: 400
				}}
			>
				<AlertTriangleSvg color={Colors['yellow-ffc700']} />
				<Text style={{ fontFamily: fontFamily.medium }} className="text-yellow-ffc700 text-base shrink">
					Нажмите, чтобы подтвердить почту и завершить настройку аккаунта.
				</Text>
			</Motion.View>
		</Motion.Pressable>
	)
}

export default EmailNotConfirmed
