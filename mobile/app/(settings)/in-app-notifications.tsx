import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import Toggle from '@/components/ui/Toggle'
import { useState } from 'react'

const InAppNotificationSetting = ({
	title,
	description
	// enabled
}: {
	title: string
	description: string
	// enabled: boolean
}) => {
	const [toggleEnabled, setToggleEnabled] = useState(false)

	return (
		<View className="flex-row justify-between items-center">
			<Pressable onPress={() => setToggleEnabled((prevState) => !prevState)} className="flex-1 pr-5">
				<Text
					className={cn('text-base', {
						'text-gray-ab': !toggleEnabled, // enabled
						'text-white': toggleEnabled // enabled
					})}
					style={{ fontFamily: fontFamily.medium }}
				>
					{title}
				</Text>
				<Text
					className={cn('text-xs', {
						'text-gray-ab': !toggleEnabled, // enabled
						'text-white': toggleEnabled // enabled
					})}
					style={{ fontFamily: fontFamily.medium }}
				>
					{description}
				</Text>
			</Pressable>
			<Toggle value={toggleEnabled} onChange={() => setToggleEnabled((prevState) => !prevState)} />
		</View>
	)
}

const SettingsInAppNotificationsPage = () => {
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>Настройка уведомлений</HeaderBack>
				<ScrollView
					style={{ flex: 1, width: '100%' }}
					contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
				>
					<View className="gap-[16px]">
						<InAppNotificationSetting
							title="Добавление в друзья"
							description="Получать уведомление, когда кто-то добавляет меня в друзья"
							//enabled={true}
						/>
						<InAppNotificationSetting
							title="Приглашение на тренировку"
							description="Получать уведомление, когда кто-то приглашает меня на тренировку"
							//enabled={false}
						/>
						<InAppNotificationSetting
							title="Новое достижение"
							description="Получать уведомление, когда я получаю новое достижение"
							//enabled={false}
						/>
						<InAppNotificationSetting
							title="Пост о тренировке"
							description="Получать уведомление, когда хост тренировки выкладывает публикацию о прошедшей тренировке"
							//enabled={false}
						/>
					</View>
				</ScrollView>
			</Container>
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default SettingsInAppNotificationsPage
