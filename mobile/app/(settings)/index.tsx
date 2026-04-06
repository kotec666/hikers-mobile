import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'

const SettingsPage = () => {
	const { push } = useSafeNavigation()
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>Настройки</HeaderBack>
				<ScrollView
					style={{ flex: 1, width: '100%' }}
					contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
				>
					<View className="gap-[16px]">
						<Setting
							title="Уведомления внутри приложения"
							onPress={() => push('/(settings)/in-app-notifications')}
						/>
						<Setting
							title={[{ text: 'Выбор своего ' }, { text: 'цвета', color: Colors['green-main'] }]}
							onPress={() => push('/document')}
						/>
					</View>
				</ScrollView>
			</Container>
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default SettingsPage
