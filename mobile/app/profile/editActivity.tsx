import React from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'

const ProfileEditActivity = () => {
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px]">
				<HeaderBack>Топ 3 активности на показ</HeaderBack>
				<ActivityInfo isChooseMode />
			</Container>
		</SafeAreaProvider>
	)
}

export default ProfileEditActivity
