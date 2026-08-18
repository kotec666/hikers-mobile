import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text, I18nManager, NativeModules, Platform } from 'react-native'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import { fontFamily } from '@/constants/Fonts'
import { Motion } from '@legendapp/motion'
import Modal from '@/components/ui/Modal/Modal'
import React, { useState } from 'react'
import BlurProvider from '@/components/providers/BlurProvider'
import { Button } from '@/components/ui/Button'
import { removeUserWorkoutStorage } from '@/store/workoutStorage'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'expo-router'
import AlertTriangleSvg from '@/components/svg/AlertTriangleSvg'
import { useDeleteProfileMutation } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import { Directions, Language, LngShort, setLngToStorage, supportedLanguages } from '@/store/languageStorage'
import VerticalPicker from '@/components/ui/VerticalPicker/VerticalPicker'
import { useTranslation } from 'react-i18next'
import { YamapInstance } from 'react-native-yamap-plus'

const SettingsPage = () => {
	const { t, i18n } = useTranslation()
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const router = useRouter()
	const { mutateAsync, isPending } = useDeleteProfileMutation()

	const isAndroid = Platform.OS === 'android'

	const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
		() => supportedLanguages.find((l) => l.lngShort === (i18n.language as LngShort)) ?? null
	)

	const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)

	const closeDeleteAccountModal = () => {
		setIsDeleteAccountModalOpen(false)
	}

	const openDeleteAccountModal = () => {
		setIsDeleteAccountModalOpen(true)
	}

	const handleDeleteAccount = async () => {
		removeUserWorkoutStorage(user?.id)
		await mutateAsync()
		await logout()
		router.replace('/')
	}

	const handleSelectLanguage = async (lang: Language) => {
		setLngToStorage(lang.lngShort)

		const isRTL = lang.dir === Directions.rtl
		if (isRTL) {
			I18nManager.allowRTL(isRTL)
			I18nManager.forceRTL(isRTL)
		}
		void i18n.changeLanguage(lang.lngShort)
		setSelectedLanguage(lang)

		if (isAndroid) {
			void YamapInstance.setLocale(lang.lngLong)
		}
		// перезагрузка яндекс карт не дает моментальное изменение языка, только если перезайти в приложение с перезапуском =(
		// и перезагрузка если RTL
		if (isRTL) return NativeModules.DevSettings.reload()
	}

	return (
		<Page>
			<BlurProvider>
				<Modal
					isOpen={isDeleteAccountModalOpen}
					handleClose={closeDeleteAccountModal}
					label={t('SettingsPage.deleteAccountModal.label')}
					labelSize={16}
				>
					<View className="gap-[20px]">
						<Text style={{ fontFamily: fontFamily.medium }} className="text-white text-base">
							{t('SettingsPage.deleteAccountModal.accountDeleteText')}
						</Text>
						<View className="flex-row gap-[10px]">
							<Button onPress={closeDeleteAccountModal} variant="white" buttonContainerClassName="flex-1">
								{t('common.cancel')}
							</Button>
							<Button
								onPress={handleDeleteAccount}
								isLoading={isPending}
								variant="white"
								buttonContainerClassName="flex-1"
							>
								{t('common.delete')}
							</Button>
						</View>
					</View>
				</Modal>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>{t('SettingsPage.header')}</HeaderBack>
					<ScrollView
						style={{ flex: 1, width: '100%' }}
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: 'space-between',
							paddingBottom: 30
						}}
					>
						<View className="gap-[16px]">
							<Setting
								title={t('SettingsPage.settingsList.inAppNotifications')}
								onPress={() => push('/(settings)/in-app-notifications')}
							/>
							<Setting
								title={t('SettingsPage.settingsList.changeEmail')}
								onPress={() => push('/(settings)/change-email')}
							/>
							<Setting
								title={[
									{ text: t('SettingsPage.settingsList.chooseYour') },
									{ text: t('SettingsPage.settingsList.color'), color: Colors['green-main'] }
								]}
								onPress={() => push('/(settings)/pick-a-color')}
							/>
							<View className="flex-row justify-between items-center">
								<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
									{t('SettingsPage.settingsList.language')}
								</Text>
								<VerticalPicker
									items={supportedLanguages}
									mapOptionToLabel={(item) => item.language}
									mapOptionToKey={(item) => item.lngShort}
									onChange={(value) => value && handleSelectLanguage(value)}
									value={selectedLanguage}
								/>
							</View>
						</View>
						<View className="gap-[16px]">
							<Motion.Pressable onPress={openDeleteAccountModal}>
								<Motion.View
									className="flex-row items-center gap-[12px] rounded-[14px] bg-black-25 p-[12px]"
									whileTap={{ scale: 0.9 }}
									transition={{
										type: 'spring',
										damping: 20,
										stiffness: 400
									}}
								>
									<AlertTriangleSvg />
									<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
										{t('SettingsPage.deleteAccount')}
									</Text>
								</Motion.View>
							</Motion.Pressable>
							<View>
								<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-sm">
									{t('SettingsPage.deleteAccountDetails')}
								</Text>
							</View>
						</View>
					</ScrollView>
				</Container>
			</BlurProvider>
		</Page>
	)
}

export default SettingsPage
