import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs'
import { tabsConfig } from '@/components/ui/Navbar/tabs.config'
import { SFSymbols6_0 } from 'sf-symbols-typescript'
import {usePathname} from "expo-router";
import {ThemeProvider} from "@react-navigation/core";
import {DarkTheme} from "@react-navigation/native";

export default function NativeTabsComponent() {
    const pathname = usePathname()
    const shouldHide = pathname.startsWith('/newTraining')
    // @TODO обновить до expo="55"
    // @TODO https://github.com/expo/expo/issues/39969
	return (
        <ThemeProvider value={DarkTheme}>
            <NativeTabs
                backgroundColor="black"
                tintColor="white"
                iconColor="white"
                labelStyle={{ color: 'white' }}
            >
                {tabsConfig.map((tab) => (
                    <NativeTabs.Trigger
                        key={tab.id}
                        name={tab.route}
                        disableScrollToTop={tab.id === 'newTraining'}
                    >
                        <Label>{tab.label}</Label>
                        <Icon sf={tab.nativeIcon.sf as SFSymbols6_0} drawable={tab.nativeIcon.drawable} />
                        {tab.badge && <Badge>{tab.badge}</Badge>}
                    </NativeTabs.Trigger>
                ))}
            </NativeTabs>
        </ThemeProvider>
	)
}
