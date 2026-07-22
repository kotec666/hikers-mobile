import { ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import BlurProvider from '@/components/providers/BlurProvider'
import { useLocalSearchParams } from 'expo-router'
import { useAchievementsQuery } from '@/queries/achievements'
import { Page } from '@/components/ui/Page'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'

const AchievementsPage = () => {
	const { id } = useLocalSearchParams<{ id?: string }>()

	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)

	const { data = { claimed: [], unclaimed: [], all: [] }, isLoading } = useAchievementsQuery()
	const claimedAchievements = data.claimed
	const unClaimedAchievements = data.unclaimed
	const allAchievements = data.all

	const openBottomSheet = useCallback(async (newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		await bottomSheetRef.current?.openSheet()
	}, [])

	// открытие по query param
	useEffect(() => {
		if (!id || isLoading || !allAchievements) return

		const targetAchievement = allAchievements.find((a) => a.id === id)

		if (targetAchievement) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- реакция на query-параметр из роутера и асинхронные данные запроса, плюс императивный вызов bottomSheetRef.openSheet()
			openBottomSheet(<AchievementDetailed achievement={targetAchievement} />)
		}
	}, [id, isLoading, allAchievements, openBottomSheet])

	const handlePressAchievement = async (achievementId: string) => {
		const achievement = allAchievements.find((a) => a.id === achievementId)

		if (achievement) {
			await openBottomSheet(<AchievementDetailed achievement={achievement} />)
		}
	}

	return (
		<Page>
			<BlurProvider>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>Мои достижения</HeaderBack>
					<ScrollView
						style={{ flex: 1, width: '100%' }}
						contentContainerStyle={{
							paddingBottom: 50
						}}
					>
						<View className="gap-[10px]">
							{claimedAchievements.length > 0 ? (
								<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
									Полученные
								</Text>
							) : null}
							{claimedAchievements.map((achievement) => (
								<AchievementsListItem
									key={achievement.id}
									id={achievement.id}
									progress={achievement.progress}
									title={achievement.title}
									colorHex={achievement.colorHex}
									iconFilename={achievement.iconFilename}
									handleClickAchievement={handlePressAchievement}
								/>
							))}
							{unClaimedAchievements.length > 0 ? (
								<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
									Не полученные
								</Text>
							) : null}
							{unClaimedAchievements.map((achievement) => (
								<AchievementsListItem
									key={achievement.id}
									id={achievement.id}
									progress={achievement.progress}
									title={achievement.title}
									colorHex={achievement.colorHex}
									iconFilename={achievement.iconFilename}
									handleClickAchievement={handlePressAchievement}
								/>
							))}
						</View>
					</ScrollView>
				</Container>
				<BottomSheet ref={bottomSheetRef}>{bottomSheetContent}</BottomSheet>
			</BlurProvider>
		</Page>
	)
}

export default AchievementsPage
