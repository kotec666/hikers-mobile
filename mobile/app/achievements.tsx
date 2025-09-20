import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React from 'react'
import AchievementsListItem from '@/components/ui/Achievements/AchievementsListItem'
import { fontFamily } from '@/constants/Fonts'

const AchievementsPage = () => {
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Мои достижения</HeaderBack>
					<ScrollView style={{ flex: 1, width: '100%' }}>
						<View className="gap-[10px]">
							<AchievementsListItem progress={1} />
							<AchievementsListItem progress={2} />
							<AchievementsListItem progress={3} />
							<AchievementsListItem progress={4} />
							<AchievementsListItem progress={5} />
							<AchievementsListItem progress={6} />
							<AchievementsListItem progress={7} />
							<AchievementsListItem progress={8} />
							<AchievementsListItem progress={9} />
							<AchievementsListItem progress={10} />
							<AchievementsListItem progress={11} />
							<AchievementsListItem progress={12} />
							<AchievementsListItem progress={13} />
							<AchievementsListItem progress={14} />
							<AchievementsListItem progress={15} />
							<AchievementsListItem progress={16} />
							<AchievementsListItem progress={17} />
							<AchievementsListItem progress={18} />
							<AchievementsListItem progress={19} />
							<AchievementsListItem progress={20} />
							<AchievementsListItem progress={21} />
							<AchievementsListItem progress={22} />
							<AchievementsListItem progress={23} />
							<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
								Неполученные
							</Text>
							<AchievementsListItem progress={24} />
							<AchievementsListItem progress={25} />
							<AchievementsListItem progress={26} />
							<AchievementsListItem progress={27} />
							<AchievementsListItem progress={28} />
							<AchievementsListItem progress={29} />
							<AchievementsListItem progress={30} />
							<AchievementsListItem progress={31} />
							<AchievementsListItem progress={32} />
							<AchievementsListItem progress={33} />
							<AchievementsListItem progress={34} />
							<AchievementsListItem progress={35} />
							<AchievementsListItem progress={36} />
							<AchievementsListItem progress={37} />
							<AchievementsListItem progress={38} />
							<AchievementsListItem progress={39} />
							<AchievementsListItem progress={40} />
							<AchievementsListItem progress={41} />
							<AchievementsListItem progress={42} />
							<AchievementsListItem progress={43} />
							<AchievementsListItem progress={44} />
							<AchievementsListItem progress={45} />
							<AchievementsListItem progress={100} />
						</View>
					</ScrollView>
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default AchievementsPage
