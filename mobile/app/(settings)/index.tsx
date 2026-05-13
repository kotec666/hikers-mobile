import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text } from 'react-native'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import { fontFamily } from '@/constants/Fonts'
import { Motion } from '@legendapp/motion'
import Modal from '@/components/ui/Modal/Modal'
import React from 'react'
import BlurProvider from '@/components/providers/BlurProvider'
import { Button } from '@/components/ui/Button'
import { removeUserWorkoutStorage } from '@/store/workoutStorage'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'expo-router'
import AlertTriangleSvg from '@/components/svg/AlertTriangleSvg'
import { useDeleteProfileMutation } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'

const SettingsPage = () => {
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const toast = useToast()
	const router = useRouter()
	const { mutateAsync, isPending } = useDeleteProfileMutation()

	const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = React.useState(false)

	const closeDeleteAccountModal = () => {
		setIsDeleteAccountModalOpen(false)
	}

	const openDeleteAccountModal = () => {
		setIsDeleteAccountModalOpen(true)
	}

	const handleDeleteAccount = async () => {
		try {
			removeUserWorkoutStorage(user?.id)
			await mutateAsync()
			await logout()
			toast.success('Аккаунт успешно удален')
			router.replace('/')
		} catch {
			toast.error('Ошибка при удалении аккаунта')
		}
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
						<Text style={{ fontFamily: fontFamily.medium }} className="text-white text-base">
							Вы уверены, что хотите удалить свою учетную запись? Это действие необратимо, и все ваши
							данные будут безвозвратно удалены.
						</Text>
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
										Удалить аккаунт
									</Text>
								</Motion.View>
							</Motion.Pressable>
							<View>
								<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-sm">
									Удаление вашей учетной записи является необратимым и не подлежит отмене. Все ваши
									данные, тренировки и история будут потеряны навсегда.
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
