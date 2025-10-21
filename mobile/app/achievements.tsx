import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimensions, SafeAreaView, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import { getClaimedAchievements, getUnclaimedAchievements, IAchievement } from '@/api/achievements'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const { height: screenHeight } = Dimensions.get('screen')

const AchievementsPage = () => {
	const insets = useSafeAreaInsets()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)
	const [state, setState] = useState<{
		claimedAchievements: IAchievement[]
		unClaimedAchievements: IAchievement[]
	}>({
		claimedAchievements: [],
		unClaimedAchievements: []
	})

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	useEffect(() => {
		;(async () => {
			try {
				const [unClaimedAchievements, claimedAchievements] = await Promise.all([
					getUnclaimedAchievements(),
					getClaimedAchievements()
				])

				setState((s) => ({ ...s, claimedAchievements, unClaimedAchievements }))
			} catch (e) {
				const errors = await e.response.json()
				console.log(errors)
				/* const formattedErrors = */
				getFieldsErrors(errors)
				// setState((s) => ({ ...s, errors: formattedErrors }))
			}
		})()
	}, [])

	const handleClickAchievement = (achievementId: string) => {
		const clickedAchievement = [...state.claimedAchievements, ...state.unClaimedAchievements].find(
			(achievement) => achievement.id === achievementId
		)
		if (clickedAchievement) {
			openBottomSheet(<AchievementDetailed achievement={clickedAchievement} />)
		}
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
				<SafeAreaView style={{ flex: 1 }}>
					<Container className="gap-[20px] mt-[20px] flex-1">
						<HeaderBack>Мои достижения</HeaderBack>
						<ScrollView style={{ flex: 1, width: '100%' }}>
							<View className="gap-[10px]">
								{state.claimedAchievements.length && (
									<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
										Полученные
									</Text>
								)}
								{state.claimedAchievements.map((achievement) => (
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
								{state.unClaimedAchievements.length && (
									<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
										Не полученные
									</Text>
								)}
								{state.unClaimedAchievements.map((achievement) => (
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
				</SafeAreaView>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}

export default AchievementsPage
