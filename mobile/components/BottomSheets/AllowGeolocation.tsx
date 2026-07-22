import React from 'react'
import { Text, View } from 'react-native'
import GeolocationPermissionSvg from '@/components/svg/GeolocationPermissionSvg'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

const AllowGeolocation = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<GeolocationPermissionSvg />
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
					Разрешите доступ к геолокации
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					Разрешить
				</Button>
				<Button variant="transparent" onPress={props.close}>
					Не сейчас
				</Button>
			</View>
		</View>
	)
}

export default AllowGeolocation
