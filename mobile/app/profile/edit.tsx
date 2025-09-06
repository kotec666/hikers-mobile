import React from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { TouchableOpacity, View } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { Input } from '@/components/ui/Input'
import { useRouter } from 'expo-router'

const ProfileEdit = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px]">
				<HeaderBack>Редактирование профиля</HeaderBack>
				<View className="gap-[20px]">
					<View className="gap-[16px]">
						<View className="flex-row justify-between w-full">
							<UserAvatar
								isEditMode
								className="w-[117px] h-[117px]"
								iconSize={{ width: 60, height: 60 }}
								avatar={false}
							/>
						</View>
						<View className="gap-[10px]">
							<Input error="Такой email уже используется" value="Сергей Авдотьев" />
							<Input value="@oxxysergey" />
						</View>
					</View>
					<TouchableOpacity onPress={() => router.push('/profile/editActivity')}>
						<ActivityInfo isEditMode label="Топ 3 активности на показ" />
					</TouchableOpacity>
					<View className="my-[30px]">
						<Button variant="white">Сохранить</Button>
					</View>
				</View>
			</Container>
		</SafeAreaProvider>
	)
}

export default ProfileEdit
