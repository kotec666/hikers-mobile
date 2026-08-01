import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

const AllowDeniedGeolocation = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					Без разрешения на получение геолокации в фоновом и активном режиме невозможно начать тренировку.
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					Включите разрешение в настройках приложения
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					Открыть настройки
				</Button>
				<Button variant="transparent" onPress={props.close}>
					Не сейчас
				</Button>
			</View>
		</View>
	)
}

export default AllowDeniedGeolocation
