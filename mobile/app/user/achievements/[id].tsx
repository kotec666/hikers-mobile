import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback, useRef, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import AchievementDetailed from '@/components/BottomSheets/AchievementDetailed'
import { useLocalSearchParams } from 'expo-router'
import BlurProvider from '@/components/providers/BlurProvider'
import { useUserAchievementsQuery } from '@/queries/achievements'
import { Page } from '@/components/ui/Page'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { Colors } from '@/constants/Colors'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { AchievementsListSkeleton } from '@/components/ui/skeleton'

const UserAchievementsPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)

	const openBottomSheet = useCallback(async (newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			await bottomSheetRef.current.openSheet()
		}
	}, [])

	const { data: userAchievements = [], isLoading, isRefetching, isError, refetch } = useUserAchievementsQuery(id)

	const handleRetry = useCallback(() => {
		return refetch()
	}, [refetch])

	const handleClickAchievement = async (achievementId: string) => {
		const clickedAchievement = userAchievements.find((achievement) => achievement.id === achievementId)
		if (clickedAchievement) {
			await openBottomSheet(<AchievementDetailed achievement={clickedAchievement} />)
		}
	}

	return (
		<Page>
			<BlurProvider>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>Достижения</HeaderBack>
					{isLoading ? (
						<AchievementsListSkeleton />
					) : isError && userAchievements.length === 0 ? (
						<View style={{ flex: 1 }} className="items-center justify-center px-4">
							<LoadQueryErrorRetry text="Не удалось загрузить достижения" onRetry={handleRetry} />
						</View>
					) : (
						<ScrollView
							style={{ flex: 1, width: '100%' }}
							contentContainerStyle={{ paddingBottom: 50 }}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching}
									onRefresh={() => refetchAndHaptics(handleRetry)}
									tintColor={Colors['green-main']}
								/>
							}
						>
							<View className="gap-[10px]">
								{isError && (
									<Text className="text-red-500 text-sm">
										Не удалось обновить достижения.{' '}
										<Text onPress={handleRetry} className="underline">
											Повторить
										</Text>
									</Text>
								)}
								{userAchievements.length > 0 && (
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
					)}
				</Container>
				<BottomSheet ref={bottomSheetRef}>{bottomSheetContent}</BottomSheet>
			</BlurProvider>
		</Page>
	)
}

export default UserAchievementsPage
