import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text, Pressable, AppState } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import Toggle from '@/components/ui/Toggle/Toggle'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotificationSettings, changeNotificationSettings, NotificationSettings } from '@/api/settings'
import { NotificationType } from '@shared/enums'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'

const InAppNotificationSetting = ({
	title,
	description,
	enabled,
	onToggle,
	disabled
}: {
	title: string
	description: string
	enabled: boolean
	onToggle: (value: boolean) => void
	disabled?: boolean
}) => {
	return (
		<View className="flex-row justify-between items-center pr-[2px]">
			<Pressable
				disabled={disabled}
				onPress={() => onToggle(!enabled)}
				className={cn('flex-1 pr-5', {
					'opacity-50': disabled
				})}
			>
				<Text
					className={cn('text-base', {
						'text-gray-ab': !enabled,
						'text-white': enabled
					})}
					style={{ fontFamily: fontFamily.medium }}
				>
					{title}
				</Text>
				<Text
					className={cn('text-xs', {
						'text-gray-ab': !enabled,
						'text-white': enabled
					})}
					style={{ fontFamily: fontFamily.medium }}
				>
					{description}
				</Text>
			</Pressable>
			<Toggle value={enabled} onChange={onToggle} disabled={disabled} />
		</View>
	)
}

const SettingsInAppNotificationsPage = () => {
	const insets = useSafeAreaInsets()
	const queryClient = useQueryClient()

	const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null)
	const localSettingsRef = useRef<NotificationSettings | null>(null)
	const settingsRef = useRef<NotificationSettings | null>(null)

	const { data: settings, isLoading } = useQuery<NotificationSettings>({
		queryKey: ['inAppNotificationSettings'],
		queryFn: getNotificationSettings
	})

	useEffect(() => {
		if (settings) {
			setLocalSettings(settings)
			localSettingsRef.current = settings
			settingsRef.current = settings
		}
	}, [settings])

	const mutation = useMutation({
		mutationFn: changeNotificationSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['inAppNotificationSettings'] })
		}
	})
	const { mutate } = mutation

	const handleToggleChange = (key: keyof NotificationSettings, value: boolean) => {
		setLocalSettings((prevState) => {
			const updatedState = { ...prevState, [key]: value } as NotificationSettings
			localSettingsRef.current = updatedState
			return updatedState
		})
	}

	// Отправка изменений при уходе со страницы
	useFocusEffect(
		useCallback(() => {
			return () => {
				const local = localSettingsRef.current
				const original = settingsRef.current

				if (local && original && JSON.stringify(local) !== JSON.stringify(original)) {
					mutate(local)
				}
			}
		}, [mutate])
	)

	// Отправка изменений при уходе приложения в фон
	useEffect(() => {
		const sub = AppState.addEventListener('change', (state) => {
			if (state !== 'active') {
				const local = localSettingsRef.current
				const original = settingsRef.current

				if (local && original && JSON.stringify(local) !== JSON.stringify(original)) {
					mutate(local)
				}
			}
		})
		return () => sub.remove()
	}, [mutate])

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
							enabled={localSettings?.friend_invite ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.FRIEND_INVITE, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title="Приглашение на тренировку"
							description="Получать уведомление, когда кто-то приглашает меня на тренировку"
							enabled={localSettings?.trainig_invite ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.TRAINING_INVITE, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title="Новое достижение"
							description="Получать уведомление, когда я получаю новое достижение"
							enabled={localSettings?.new_achievement ?? true}
							onToggle={(val) => handleToggleChange('new_achievement' as NotificationType, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title="Пост о тренировке"
							description="Получать уведомление, когда хост тренировки выкладывает публикацию о прошедшей тренировке"
							enabled={localSettings?.tagged_in_post ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.TAGGED_IN_POST, val)}
							disabled={isLoading}
						/>
					</View>
				</ScrollView>
			</Container>
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default SettingsInAppNotificationsPage
