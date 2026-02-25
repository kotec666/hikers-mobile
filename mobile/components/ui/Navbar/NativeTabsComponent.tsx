import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { SFSymbols6_0 } from 'sf-symbols-typescript'
// import { usePathname } from 'expo-router'

export default function NativeTabsComponent() {
	// const pathname = usePathname()
	// const shouldHide = pathname.startsWith('/newTraining')
	// @TODO https://github.com/expo/expo/issues/39969
	return (
		<NativeTabs>
			{tabsConfig.map((tab) => (
				<NativeTabs.Trigger key={tab.id} name={tab.route} disableScrollToTop={tab.id === 'newTraining'}>
					<NativeTabs.Trigger.TabBar />
					<Label>{tab.label}</Label>
					<Icon sf={tab.nativeIcon.sf as SFSymbols6_0} drawable={tab.nativeIcon.drawable} />
					{tab.badge && <Badge>{tab.badge}</Badge>}
				</NativeTabs.Trigger>
			))}
		</NativeTabs>
	)
}
