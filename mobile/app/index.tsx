import { View } from 'react-native'
import { Slider } from '@/components/Slider/Slider'
import { slides } from '@/constants/Slider'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'expo-router'
import { getIsAccountExist } from '@/store/authStorage'
import { AUTH_MODE } from '@/app/auth'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Page } from '@/components/ui/Page'

const HelloPage = () => {
	const { isAuthenticated } = useAuthStore()
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
		<Page
			edges={[]}
			statusBarProps={{
				style: 'dark'
			}}
		>
			<View className="flex-1 pb-[40px]">
				<Slider itemList={slides}>
					<Button variant="white" onPress={handleClickEnter}>
						Войти
					</Button>
				</Slider>
			</View>
		</Page>
	)
}

export default HelloPage
