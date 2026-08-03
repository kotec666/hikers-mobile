import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { SFSymbols6_0 } from 'sf-symbols-typescript'
import { usePathname } from 'expo-router'
import { Colors } from '@/constants/Colors'

export default function NativeTabsComponent() {
	const pathname = usePathname()
	const shouldHide = pathname.startsWith('/newTraining')

	return (
		<NativeTabs
			hidden={shouldHide}
			backgroundColor={Colors['black-0d']}
			unstable_nativeProps={{
				colorScheme: 'dark',
				nativeContainerStyle: { backgroundColor: Colors['black-0d'] }
			}}
		>
			{tabsConfig.map((tab) => (
				<NativeTabs.Trigger key={tab.id} name={tab.route} disableScrollToTop={tab.id === 'newTraining'}>
					<NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon
						sf={tab.nativeIcon.sf as SFSymbols6_0}
						drawable={tab.nativeIcon.drawable}
					/>
					{/*{tab.badge && <Badge>{tab.badge}</Badge>}*/}
				</NativeTabs.Trigger>
			))}
		</NativeTabs>
	)
}
