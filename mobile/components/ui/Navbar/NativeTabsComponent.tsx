import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { SFSymbols6_0 } from 'sf-symbols-typescript'

export default function NativeTabsComponent() {
	return (
		<NativeTabs>
			{tabsConfig.map((tab) => (
				<NativeTabs.Trigger key={tab.id} name={tab.href} disableScrollToTop={tab.id === 'newTraining'}>
					<Label>{tab.label}</Label>
					<Icon sf={tab.nativeIcon.sf as SFSymbols6_0} drawable={tab.nativeIcon.drawable} />
					{tab.badge && <Badge>{tab.badge}</Badge>}
				</NativeTabs.Trigger>
			))}
		</NativeTabs>
	)
}
