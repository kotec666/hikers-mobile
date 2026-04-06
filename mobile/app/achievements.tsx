import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimensions, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import {
	getAchievements,
	getClaimedAchievements,
	getUnclaimedAchievements,
	IAchievement,
	IAchievementsResponse
} from '@/api/achievements'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import BlurProvider from '@/components/providers/BlurProvider'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

const { height: screenHeight } = Dimensions.get('screen')

type AchievementsVM = {
	claimed: IAchievement[]
	unclaimed: IAchievement[]
	all: IAchievement[]
}

const AchievementsPage = () => {
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id?: string }>()

	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)

	const { data = { claimed: [], unclaimed: [], all: [] }, isLoading } = useQuery<
		IAchievementsResponse,
		unknown,
		AchievementsVM
	>({
		queryKey: ['my-achievements'],
		queryFn: getAchievements,
		select: (data) => ({
			claimed: data.claimed,
			unclaimed: data.unclaimed,
			all: [...data.claimed, ...data.unclaimed]
		})
	})

	const claimedAchievements = data.claimed
	const unClaimedAchievements = data.unclaimed
	const allAchievements = data.all

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		bottomSheetRef.current?.openSheet()
	}, [])

	// открытие по query param
	useEffect(() => {
		if (!id || isLoading || !allAchievements) return

		const targetAchievement = allAchievements.find((a) => a.id === id)

		if (targetAchievement) {
			openBottomSheet(<AchievementDetailed achievement={targetAchievement} />)
		}
	}, [id, isLoading, allAchievements, openBottomSheet])

	const handlePressAchievement = (achievementId: string) => {
		const achievement = allAchievements.find((a) => a.id === achievementId)

		if (achievement) {
			openBottomSheet(<AchievementDetailed achievement={achievement} />)
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<BlurProvider>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Мои достижения</HeaderBack>
					<ScrollView
						style={{ flex: 1, width: '100%' }}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20
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
				<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
					{bottomSheetContent}
				</BottomSheet>
			</BlurProvider>
		</SafeAreaProvider>
	)
}

export default AchievementsPage
