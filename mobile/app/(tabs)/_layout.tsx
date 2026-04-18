import { Tabs, Stack, Redirect, usePathname, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Keyboard, Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'
import { Colors } from '@/constants/Colors'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { useCallback, useEffect } from 'react'
import * as QuickActions from 'expo-quick-actions'
import { useQuickActionRouting } from 'expo-quick-actions/router'
import type { RouterAction } from 'expo-quick-actions/router'

const QUICK_ACTION_ITEMS: RouterAction<string>[] = [
	{
		id: 'new-training',
		title: 'Новая тренировка',
		icon: Platform.select({ ios: 'add', android: 'quick_action_new_training' }),
		params: {
			href: '/newTraining'
		}
	},
	{
		id: 'search',
		title: 'Поиск',
		icon: Platform.select({ ios: 'search', android: 'quick_action_search' }),
		params: {
			href: '/posts?quickAction=search'
		}
	}
]

const AppNavigator = (props: { isAuthenticated: boolean }) => {
	return (
		<Tabs
			initialRouteName="profile"
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: { display: 'none' },
				animation: 'fade',
				sceneStyle: {
					backgroundColor: Colors['black-0d']
				}
			}}
			tabBar={() => <NavBar />}
		>
			<Stack.Protected guard={props.isAuthenticated}>
				<Tabs.Screen name="profile" />
				<Tabs.Screen name="posts" />
				<Tabs.Screen name="newTraining" />
			</Stack.Protected>
		</Tabs>
	)
}

const Root = ({
	isLiquidGlassAvailable,
	isAuthenticated
}: {
	isLiquidGlassAvailable: boolean
	isAuthenticated: boolean
}) => {
	return <>{isLiquidGlassAvailable ? <NativeTabsComponent /> : <AppNavigator isAuthenticated={isAuthenticated} />}</>
}

export default function TabLayout() {
	const { isAuthenticated } = useAuthStore()
	const pathname = usePathname()
	const router = useRouter()

	const handleQuickAction = useCallback(
		(action: QuickActions.Action) => {
			Keyboard.dismiss()

			if (action.id === 'new-training') {
				router.navigate('/newTraining')
				return true
			}

			if (action.id === 'search') {
				router.navigate(`/posts?quickAction=search&quickActionAt=${Date.now()}`)
				return true
			}
		},
		[router]
	)

	useQuickActionRouting(handleQuickAction)

	useEffect(() => {
		QuickActions.setItems<RouterAction<string>>(QUICK_ACTION_ITEMS).catch(console.warn)
	}, [])

	if (!isAuthenticated) {
		return <Redirect href="/auth" />
	}

	const shouldHide = pathname.startsWith('/newTraining') // Костыль, потому что на странице новой тренировки из-за NativeTabs нельзя перетаскивать BottomSheetResizable
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
	return (
		<>
			<Root isLiquidGlassAvailable={isGlassAvailable && !shouldHide} isAuthenticated={isAuthenticated} />
		</>
	)
}
