import React from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/ui/Button'
import { getClaimedAchievements } from '@/api/achievements'
import { useAuthStore } from '@/store/authStore'

const Testauth = () => {
	const { user, accessToken } = useAuthStore()

	const handleClick = async () => {
		try {
			const result = await getClaimedAchievements()
			console.log(result)
		} catch (e) {
			console.log('Ошибка при отправке запроса на получение полученных достижений', e)
		}
	}

	return (
		<View className="pt-[150px]">
			<Button variant="white" onPress={handleClick}>
				Отправить запрос
			</Button>
			<Text className="text-white">user: {JSON.stringify(user, null, 2)}</Text>
			<Text className="text-white">token: {JSON.stringify(accessToken, null, 2)}</Text>
		</View>
	)
}

export default Testauth
