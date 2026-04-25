import { View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Slider } from '@/components/Slider/Slider'
import { slides } from '@/constants/Slider'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'expo-router'
import { getIsAccountExist } from '@/store/authStorage'
import { AUTH_MODE } from '@/app/auth'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

const HelloPage = () => {
	const { isAuthenticated } = useAuthStore()
	const insets = useSafeAreaInsets()
	const router = useRouter()

	const handleClickEnter = async () => {
		if ((await getIsAccountExist())?.accountExist) {
			return router.navigate(`/auth?mode=${AUTH_MODE.AUTH}`)
		} else {
			return router.navigate(`/auth?mode=${AUTH_MODE.REGISTRATION}`)
		}
	}

	useEffect(() => {
		if (isAuthenticated) {
			router.replace('/(tabs)/profile')
		}
	}, [isAuthenticated, router])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<View className="flex-1 pb-[40px]">
				<Slider itemList={slides}>
					<Button variant="white" onPress={handleClickEnter}>
						Войти
					</Button>
				</Slider>
				<StatusBar style="light" />
			</View>
		</SafeAreaProvider>
	)
}

export default HelloPage
