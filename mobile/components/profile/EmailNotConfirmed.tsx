import React from 'react'
import { Motion } from '@legendapp/motion'
import AlertTriangleSvg from '@/components/svg/AlertTriangleSvg'
import { Platform, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import { useToast } from '@/hooks/useToast'
import { requestConfirmEmailCode } from '@/api/auth'
import { createTimer, isRateLimited, TimerType } from '@/store/timerStorage'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import * as Haptics from 'expo-haptics'
import { RelativePathString } from 'expo-router'

const EmailNotConfirmed = ({ isVisible, email }: { isVisible: boolean; email?: string }) => {
	const toast = useToast()
	const { push } = useSafeNavigation()

	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const handlePress = async () => {
		if (!email) {
			return toast.error('email не указан')
		}

		const hasActiveTimer = isRateLimited(TimerType.EMAIL_CONFIRMATION, email)

		if (hasActiveTimer) {
			return push(`/mail-confirmation?email=${email}` as RelativePathString)
		}

		try {
			const requestCodeResult = await requestConfirmEmailCode(email)
			createTimer(TimerType.EMAIL_CONFIRMATION, email, requestCodeResult.waitMs)

			return push(`/mail-confirmation?email=${email}` as RelativePathString)
		} catch (e) {
			toast.error('Произошла ошибка')
			await getFieldsErrors(e)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	const containerStyles = {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		gap: 12,
		borderRadius: 14,
		padding: 12
	}

	const fallbackStyles = {
		...containerStyles,
		backgroundColor: Colors['black-25'],
		borderWidth: 1,
		borderColor: Colors['black-44']
	}

	if (!isVisible) return null

	const Content = (
		<>
			<AlertTriangleSvg color={Colors['yellow-ffc700']} />
			<Text style={{ fontFamily: fontFamily.medium }} className="text-yellow-ffc700 text-base shrink">
				Нажмите, чтобы подтвердить почту и завершить настройку аккаунта.
			</Text>
		</>
	)

	return (
		<Motion.Pressable onPress={handlePress}>
			<Motion.View
				whileTap={{ scale: 0.9 }}
				transition={{
					type: 'spring',
					damping: 20,
					stiffness: 400
				}}
			>
				{isGlassAvailable ? (
					<GlassView colorScheme="dark" style={containerStyles}>
						{Content}
					</GlassView>
				) : (
					<View style={fallbackStyles}>{Content}</View>
				)}
			</Motion.View>
		</Motion.Pressable>
	)
}

export default EmailNotConfirmed
