import React from 'react'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

const TrainingsEmpty = (props: { text?: string }) => {
	const router = useRouter()

	return (
		<View className="gap-[40px] flex-1 justify-center items-center">
			<Text className="text-gray-ab text-center text-[19px]" style={{ fontFamily: fontFamily.regular }}>
				{props.text}
			</Text>
			<Button onPress={() => router.push('/(tabs)/newTraining')} variant="white">
				Начать тренировку
			</Button>
		</View>
	)
}

export default TrainingsEmpty
