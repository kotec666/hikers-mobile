import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { fontFamily } from '@/constants/Fonts'
import { IAchievement } from '@/api/achievements'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LinearGradient } from 'expo-linear-gradient'
import { hexToRgba } from '@/helpers/colors/hexToRgba'
import { useTranslation } from 'react-i18next'
// import AchievementsMedalSvg from '@/components/svg/AchievementsMedalSvg'

interface IProps {
	achievement: IAchievement
}

const AchievementDetailed = (props: IProps) => {
	const { achievement } = props
	const { t } = useTranslation()

	const MAX_HEIGHT = 80
	const progress = achievement.progress
	const progressPx = (Math.min(Math.max(progress, 0), 100) / 100) * MAX_HEIGHT

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
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px] w-full">
				<View className="relative overflow-hidden p-[16px] items-center justify-center border-white/20 border-[1px] rounded-[16px] h-[80px] w-[80px]">
					<LinearGradient
						colors={progress === 100 ? notTransparentColors : transparentColors}
						locations={progress === 100 ? notTransparentLocations : transparentLocations}
						start={{ x: 0, y: 1 }}
						end={{ x: 0, y: 0 }}
						style={[styles.progressVertical, { height: progressPx }]}
					/>
					<Image
						style={{
							width: 43,
							height: 43,
							zIndex: 10
						}}
						source={{ uri: `${PATH_TO_IMAGE}${achievement.iconFilename}` }}
						contentFit="cover"
					/>
				</View>

				<View className="items-center mt-[15px] gap-[20px]">
					<View className="items-center">
						<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-xl">
							{achievement.title}
						</Text>
						<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-sm">
							{t('AchievementsPage.have')} {achievement.claimedPercent ?? 0}%{' '}
							{t('AchievementsPage.users')}
						</Text>
					</View>
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base text-center">
						{achievement.description || ''}
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
