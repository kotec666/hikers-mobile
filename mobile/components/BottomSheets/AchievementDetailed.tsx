import React from 'react'
import { Image, Text, View, StyleSheet } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { IAchievement } from '@/api/achievements'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { hexToRgba } from '@/helpers/hexToRgba'
import { LinearGradient } from 'expo-linear-gradient'
// import AchievementsMedalSvg from '@/components/svg/AchievementsMedalSvg'

interface IProps {
	achievement: IAchievement
	progress?: number
}

const AchievementDetailed = (props: IProps) => {
	const { achievement, progress = 60 } = props
	const progressHeight = Math.min(Math.max(progress, 0), 100)

	const colorHex = achievement.colorHex || '#4F7DF9' // fallback color

	const transparentColors: readonly [string, string, ...string[]] = [
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 0.8),
		hexToRgba(colorHex, 0.3),
		'transparent'
	]
	const notTransparentColors: readonly [string, string, ...string[]] = [
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 1),
		'transparent'
	]

	const transparentLocations: readonly [number, number, ...number[]] = [0, 0.7, 0.9, 1]
	const notTransparentLocations: readonly [number, number, ...number[]] = [0, 0.7, 1, 1]

	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px] w-full">
				<View className="relative overflow-hidden p-[16px] items-center justify-center border-white/20 border-[1px] rounded-[16px] h-[80px] w-[80px]">
					<LinearGradient
						colors={progressHeight === 100 ? notTransparentColors : transparentColors}
						locations={progressHeight === 100 ? notTransparentLocations : transparentLocations}
						start={{ x: 0, y: 1 }}
						end={{ x: 0, y: 0 }}
						style={[styles.progressVertical, { height: `${progressHeight}%` }]}
					/>
					<Image
						className="w-[43px] h-[43px] z-10"
						source={{ uri: `${PATH_TO_IMAGE}${achievement.iconFilename}` }}
						resizeMode="cover"
					/>
				</View>

				<View className="items-center mt-[15px] gap-[20px]">
					<View className="items-center">
						<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
							{achievement.title}
						</Text>
						<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-xs">
							Есть у {achievement.claimedPercent}% пользователей
						</Text>
					</View>
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
						{achievement.description}
					</Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	progressVertical: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0
	}
})

export default AchievementDetailed
