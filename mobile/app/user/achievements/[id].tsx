import { Dimensions, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import { useLocalSearchParams } from 'expo-router'
import BlurProvider from '@/components/providers/BlurProvider'
import { useUserAchievementsQuery } from '@/queries/achievements'
import { Page } from '@/components/ui/Page'

const { height: screenHeight } = Dimensions.get('screen')

const UserAchievementsPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	const { data: userAchievements = [] } = useUserAchievementsQuery(id)

	const handleClickAchievement = (achievementId: string) => {
		const clickedAchievement = userAchievements.find((achievement) => achievement.id === achievementId)
		if (clickedAchievement) {
			openBottomSheet(<AchievementDetailed achievement={clickedAchievement} />)
		}
	}

	return (
		<Page>
			<BlurProvider>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Достижения</HeaderBack>
					<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 50 }}>
						<View className="gap-[10px]">
							{userAchievements.length && (
								<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
									Полученные
								</Text>
							)}
							{userAchievements.map((achievement) => (
								<AchievementsListItem
									key={achievement.id}
									id={achievement.id}
									progress={achievement.progress}
									title={achievement.title}
									colorHex={achievement.colorHex}
									iconFilename={achievement.iconFilename}
									handleClickAchievement={handleClickAchievement}
								/>
							))}
						</View>
					</ScrollView>
				</Container>
				<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
					{bottomSheetContent}
				</BottomSheet>
			</BlurProvider>
		</Page>
	)
}

export default UserAchievementsPage
