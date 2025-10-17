import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useEffect, useState } from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'
import { getClaimedAchievements, getUnclaimedAchievements, IAchievement } from '@/api/achievements'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

const AchievementsPage = () => {
	const insets = useSafeAreaInsets()
	const [state, setState] = useState<{
		claimedAchievements: IAchievement[]
		unClaimedAchievements: IAchievement[]
	}>({
		claimedAchievements: [],
		unClaimedAchievements: []
	})

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
				/* const formattedErrors = */ getFieldsErrors(errors)
				// setState((s) => ({ ...s, errors: formattedErrors }))
			}
		})()
	}, [])

	console.log(state.claimedAchievements[0].iconFilename)
	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Мои достижения</HeaderBack>
					<ScrollView style={{ flex: 1, width: '100%' }}>
						<View className="gap-[10px]">
							{state.claimedAchievements.map((achievement) => (
								<AchievementsListItem
									key={achievement.id}
									progress={+achievement.claimedPercent}
									title={achievement.title}
									colorHex={achievement.colorHex}
									iconFilename={achievement.iconFilename}
								/>
							))}
							<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
								Неполученные
							</Text>
							{state.unClaimedAchievements.map((achievement) => (
								<AchievementsListItem
									key={achievement.id}
									progress={+achievement.claimedPercent}
									title={achievement.title}
									colorHex={achievement.colorHex}
									iconFilename={achievement.iconFilename}
								/>
							))}
						</View>
					</ScrollView>
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default AchievementsPage
