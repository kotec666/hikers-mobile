import React from 'react'
import { View, Text, StyleSheet, ColorValue, Image, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { LinearGradient } from 'expo-linear-gradient'
import { cn } from '@/helpers/cn'
import { hexToRgba } from '@/helpers/hexToRgba'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
// import AchievementsMedalSvg from '@/components/svg/AchievementsMedalSvg'

interface AchievementsListItemProps {
	progress?: number
	title?: string
	iconFilename: string | null
	id: string
	colorHex: string | null
	handleClickAchievement: (achievementId: string) => void
}

const AchievementsListItem = ({
	progress = 0,
	title,
	colorHex,
	iconFilename,
	id,
	handleClickAchievement
}: AchievementsListItemProps) => {
	const progressWidth = Math.min(Math.max(progress, 0), 100)
	const transparentColors: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 0.8),
		hexToRgba(colorHex, 0.3),
		'transparent'
	]
	const notTransparentColors: readonly [ColorValue, ColorValue, ...ColorValue[]] = [
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 1),
		hexToRgba(colorHex, 1),
		'transparent'
	]
	const transparentLocations: readonly [number, number, ...number[]] | null | undefined = [0, 0.7, 0.9, 1]
	const notTransparentLocations: readonly [number, number, ...number[]] | null | undefined = [0, 0.7, 1, 1]

	return (
		<TouchableOpacity onPress={() => handleClickAchievement(id)}>
			<View
				className={cn('rounded-[20px] overflow-hidden border-[1px]', {
					'border-white/20': progressWidth !== 100,
					'border-transparent': progressWidth === 100
				})}
			>
				<LinearGradient
					colors={progressWidth === 100 ? notTransparentColors : transparentColors}
					locations={progressWidth === 100 ? notTransparentLocations : transparentLocations}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={[styles.progress, { width: `${progressWidth}%` }]}
				/>
				{progressWidth === 100 && <View style={{ backgroundColor: '#4F7DF9' }} />}
				<View className="px-[10px] py-[16px] flex-row gap-[6px] items-center">
					{/*<AchievementsMedalSvg />*/}
					<Image
						className="w-[20px] h-[20px]"
						source={{ uri: `${PATH_TO_IMAGE}${iconFilename}` }}
						resizeMode="cover"
					/>
					<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
						{title}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	progress: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0
	}
})

export default AchievementsListItem
