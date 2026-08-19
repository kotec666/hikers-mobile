import { Tabs, Stack, Redirect, usePathname, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Keyboard, Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'
import { Colors } from '@/constants/Colors'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { useCallback, useEffect, useMemo } from 'react'
import * as QuickActions from 'expo-quick-actions'
import { useQuickActionRouting } from 'expo-quick-actions/router'
import type { RouterAction } from 'expo-quick-actions/router'
import { useTranslation } from 'react-i18next'

const AppNavigator = (props: { isAuthenticated: boolean }) => {
	const isIOS = Platform.OS === 'ios'

	/*
                animation: 'none' обязателен для вкладки с картой (Yandex MapKit).
                Карта рендерится через нативный SurfaceView, который живёт отдельно
                от обычного View-дерева (hole punching, минуя View.draw()).
                Fade-переход react-native-screens реализован через нативную
                Fragment-транзакцию с alpha-анимацией, а alpha/transform на
                предках не применяется к SurfaceView предсказуемо — во время
                перехода вместо карты рендерится чёрный прямоугольник.
                С animation: 'none' экран становится видимым мгновенно,
                без alpha-композитинга, и SurfaceView рендерится штатно.
                Чинится через переключение карты на TextureView (проходит
                обычный View pipeline), но такой опции в react-native-yamap-plus
                сейчас нет.
    */
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
				<Tabs.Screen name="profile" options={{ animation: isIOS ? 'fade' : 'none' }} />
				<Tabs.Screen name="posts" options={{ animation: isIOS ? 'fade' : 'none' }} />
				<Tabs.Screen name="newTraining" options={{ animation: isIOS ? 'fade' : 'none' }} />
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
	const { t } = useTranslation()

	const quickActionItems = useMemo<RouterAction<string>[]>(
		() => [
			{
				id: 'new-training',
				title: t('QuickActions.newTraining'),
				icon: Platform.select({ ios: 'add', android: 'quick_action_new_training' }),
				params: {
					href: '/newTraining'
				}
			},
			{
				id: 'search',
				title: t('QuickActions.search'),
				icon: Platform.select({ ios: 'search', android: 'quick_action_search' }),
				params: {
					href: '/posts?quickAction=search'
				}
			},
			{
				id: 'report-a-problem',
				title: t('QuickActions.reportProblem'),
				icon: Platform.select({ ios: 'compose', android: 'quick_action_report_a_problem' }),
				params: {
					href: '/(about)/report-a-problem'
				}
			}
		],
		[t]
	)

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
		QuickActions.setItems<RouterAction<string>>(quickActionItems).catch(console.warn)
	}, [quickActionItems])

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
