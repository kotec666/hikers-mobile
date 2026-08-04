import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text as RNText, I18nManager, NativeModules } from 'react-native'
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

const SettingsPage = () => {
	const { t, i18n } = useTranslation()
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const router = useRouter()
	const { mutateAsync, isPending } = useDeleteProfileMutation()

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

	const handleSelectLanguage = (lang: Language) => {
		setLngToStorage(lang.lngShort)

		const isRTL = lang.dir === Directions.rtl
		if (isRTL) {
			I18nManager.allowRTL(isRTL)
			I18nManager.forceRTL(isRTL)
		}
		void i18n.changeLanguage(lang.lngShort)
		setSelectedLanguage(lang)
		if (isRTL) return NativeModules.DevSettings.reload() //@TODO мб из-за яндекс карты релоадить всегда
	}

	return (
		<Page>
			<BlurProvider>
				<Modal
					isOpen={isDeleteAccountModalOpen}
					handleClose={closeDeleteAccountModal}
					label="Удаление аккаунта"
					labelSize={16}
				>
					<View className="gap-[20px]">
						<RNText style={{ fontFamily: fontFamily.medium }} className="text-white text-base">
							Вы уверены, что хотите удалить свою учетную запись? Это действие необратимо, и все ваши
							данные будут безвозвратно удалены.
						</RNText>
						<View className="flex-row gap-[10px]">
							<Button onPress={closeDeleteAccountModal} variant="white" buttonContainerClassName="flex-1">
								Отмена
							</Button>
							<Button
								onPress={handleDeleteAccount}
								isLoading={isPending}
								variant="white"
								buttonContainerClassName="flex-1"
							>
								Удалить
							</Button>
						</View>
					</View>
				</Modal>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>Настройки</HeaderBack>
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
								title="Уведомления внутри приложения"
								onPress={() => push('/(settings)/in-app-notifications')}
							/>
							<Setting
								title={[{ text: 'Выбор своего ' }, { text: 'цвета', color: Colors['green-main'] }]}
								onPress={() => push('/(settings)/pick-a-color')}
							/>
							<View className="flex-row justify-between items-center">
								<RNText className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
									Язык {t('LanguagePage.title')}
								</RNText>
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
									<RNText
										style={{ fontFamily: fontFamily.medium }}
										className="text-gray-ab text-base"
									>
										Удалить аккаунт
									</RNText>
								</Motion.View>
							</Motion.Pressable>
							<View>
								<RNText style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-sm">
									Удаление вашей учетной записи является необратимым и не подлежит отмене. Все ваши
									данные, тренировки и история будут потеряны навсегда.
								</RNText>
							</View>
						</View>
					</ScrollView>
				</Container>
			</BlurProvider>
		</Page>
	)
}

export default SettingsPage
