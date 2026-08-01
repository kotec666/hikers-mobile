import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

const EnableGps = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					Чтобы записывать тренировки,
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					нужно включить передачу
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					геоданных.
				</Text>
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
					Сделать это сейчас?
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					Да
				</Button>
				<Button variant="transparent" onPress={props.close}>
					Отмена
				</Button>
			</View>
		</View>
	)
}

export default EnableGps
