import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { SFSymbols6_0 } from 'sf-symbols-typescript'
import { ThemeProvider } from '@react-navigation/core'
import { DarkTheme } from '@react-navigation/native'
import { Colors } from '@/constants/Colors'
// import { usePathname } from 'expo-router'

export default function NativeTabsComponent() {
	// const pathname = usePathname()
	// const shouldHide = pathname.startsWith('/newTraining')
	// @TODO https://github.com/expo/expo/issues/39969
	return (
		<ThemeProvider value={DarkTheme}>
			<NativeTabs
				backgroundColor={Colors['black-0d']}
				tintColor="white"
				iconColor="white"
				labelStyle={{ color: 'white' }}
			>
				{tabsConfig.map((tab) => (
					<NativeTabs.Trigger
						key={tab.id}
						name={tab.route}
						disableScrollToTop={tab.id === 'newTraining'}
						options={{
							backgroundColor: Colors['black-0d']
						}}
					>
						<NativeTabs.Trigger.TabBar backgroundColor={Colors['black-0d']} />
						<Label>{tab.label}</Label>
						<Icon sf={tab.nativeIcon.sf as SFSymbols6_0} drawable={tab.nativeIcon.drawable} />
						{tab.badge && <Badge>{tab.badge}</Badge>}
					</NativeTabs.Trigger>
				))}
			</NativeTabs>
		</ThemeProvider>
	)
}
