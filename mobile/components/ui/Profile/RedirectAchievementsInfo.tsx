import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import AchievementsStats from '@/components/ui/Profile/AchievementsStats'
import { useRouter } from 'expo-router'
import { IProfileAchievement } from '@/api/profile'

const RedirectAchievementsInfo = (props: { achievements?: IProfileAchievement[] }) => {
	const router = useRouter()

	return (
		<View className="gap-[15px]">
			<TouchableOpacity onPress={() => router.push('/achievements')}>
				<View className="flex-row justify-between">
					<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
						Достижения
					</Text>
					<ArrowBackSvg style={{ transform: [{ rotateY: '180deg' }] }} />
				</View>
			</TouchableOpacity>
			<View className="flex-row justify-between gap-[10px]">
				{Boolean(props.achievements?.length) &&
					props.achievements?.map((achievement) => (
						<AchievementsStats key={achievement.id} title={achievement.title} />
					))}
			</View>
		</View>
	)
}

export default RedirectAchievementsInfo
