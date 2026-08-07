import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text, Pressable, AppState } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import Toggle from '@/components/ui/Toggle/Toggle'
import { NotificationSettings } from '@/api/settings'
import { NotificationType } from '@shared/enums'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useNotificationsSettingsQuery, useUpdateNotificationsSettingsMutation } from '@/queries/notifications'
import { Page } from '@/components/ui/Page'
import { useTranslation } from 'react-i18next'

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
	const { t } = useTranslation()
	const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null)
	const localSettingsRef = useRef<NotificationSettings | null>(null)
	const settingsRef = useRef<NotificationSettings | null>(null)
	const { data: settings, isLoading } = useNotificationsSettingsQuery()
	const { mutate } = useUpdateNotificationsSettingsMutation()

	useEffect(() => {
		if (settings) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- инициализация локального черновика данными асинхронного запроса; localSettings затем редактируется независимо от settings
			setLocalSettings(settings)
			localSettingsRef.current = settings
			settingsRef.current = settings
		}
	}, [settings])

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
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>{t('SettingsPage.inAppNotifications.header')}</HeaderBack>
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 50 }}>
					<View className="gap-[16px]">
						<InAppNotificationSetting
							title={t('SettingsPage.inAppNotifications.settingsList.addAsFriend.title')}
							description={t('SettingsPage.inAppNotifications.settingsList.addAsFriend.description')}
							enabled={localSettings?.friend_invite ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.FRIEND_INVITE, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title={t('SettingsPage.inAppNotifications.settingsList.workoutInvite.title')}
							description={t('SettingsPage.inAppNotifications.settingsList.workoutInvite.description')}
							enabled={localSettings?.trainig_invite ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.TRAINING_INVITE, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title={t('SettingsPage.inAppNotifications.settingsList.newAchievement.title')}
							description={t('SettingsPage.inAppNotifications.settingsList.newAchievement.description')}
							enabled={localSettings?.new_achievement ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.NEW_ACHIEVEMENT, val)}
							disabled={isLoading}
						/>
						<InAppNotificationSetting
							title={t('SettingsPage.inAppNotifications.settingsList.postAboutWorkout.title')}
							description={t('SettingsPage.inAppNotifications.settingsList.postAboutWorkout.description')}
							enabled={localSettings?.tagged_in_post ?? true}
							onToggle={(val) => handleToggleChange(NotificationType.TAGGED_IN_POST, val)}
							disabled={isLoading}
						/>
					</View>
				</ScrollView>
			</Container>
		</Page>
	)
}

export default SettingsInAppNotificationsPage
