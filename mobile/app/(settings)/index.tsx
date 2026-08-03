import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text as RNText, Platform } from 'react-native'
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
import ChevronSelectorVerticalSvg from '@/components/svg/ChevronSelectorVerticalSvg'
import { Language, supportedLanguages } from '@/store/languageStorage'
import { Host, Picker, Text } from '@expo/ui/swift-ui'
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers'

const LanguagePicker = ({ options }: { options: Language[] }) => {
	const [selected, setSelected] = useState<null | Language>(null)

	const handleSelectionChange = (lngShort: string) => {
		const foundLang = options.find((l) => l.lngShort === lngShort)
		if (foundLang) {
			setSelected(foundLang)
		}
	}

	return (
		<Host matchContents>
			<Picker
				label="Language"
				modifiers={[pickerStyle('menu')]}
				selection={selected?.lngShort}
				onSelectionChange={handleSelectionChange}
			>
				{options.map((option) => (
					<Text key={option.lngShort} modifiers={[tag(option.lngShort)]}>
						{option.language}
					</Text>
				))}
			</Picker>
		</Host>
	)
}

const SettingsPage = () => {
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const router = useRouter()
	const { mutateAsync, isPending } = useDeleteProfileMutation()

	const isIOS = Platform.OS === 'ios'

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
							<Setting
								title="Язык"
								icon={<ChevronSelectorVerticalSvg />}
								onPress={() => push('/(settings)/language')}
							/>
							{isIOS && <LanguagePicker options={supportedLanguages} />}
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
