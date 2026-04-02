import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dimensions, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import { getClaimedAchievementsByUserId, IAchievement } from '@/api/achievements'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import { useLocalSearchParams } from 'expo-router'
import BlurProvider from '@/components/providers/BlurProvider'

const { height: screenHeight } = Dimensions.get('screen')

const UserAchievementsPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>()
	const insets = useSafeAreaInsets()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)
	const [state, setState] = useState<{
		claimedAchievements: IAchievement[]
	}>({
		claimedAchievements: []
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
				const claimedAchievements = await getClaimedAchievementsByUserId(id)
				setState((s) => ({ ...s, claimedAchievements }))
			} catch (e: unknown) {
				/* const formattedErrors = */
				await getFieldsErrors(e)
				// setState((s) => ({ ...s, errors: formattedErrors }))
			}
		})()
	}, [])

	const handleClickAchievement = (achievementId: string) => {
		const clickedAchievement = state.claimedAchievements.find((achievement) => achievement.id === achievementId)
		if (clickedAchievement) {
			openBottomSheet(<AchievementDetailed achievement={clickedAchievement} />)
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
			<BlurProvider>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Достижения</HeaderBack>
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

export default UserAchievementsPage
