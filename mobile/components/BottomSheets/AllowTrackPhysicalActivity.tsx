import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import PhysicalActivityPermissionSvg from '@/components/svg/PhysicalActivityPermissionSvg'

const AllowTrackPhysicalActivity = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<PhysicalActivityPermissionSvg width={36} height={36} />
				<View className="items-center">
					<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
						Разрешите доступ к отслеживанию
					</Text>
					<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
						физической активности
					</Text>
				</View>
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

export default AllowTrackPhysicalActivity
