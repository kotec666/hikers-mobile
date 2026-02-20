import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs'

export default function NativeTabsComponent() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="/(tabs)/posts">
				<Label>Посты</Label>
				<Icon sf="book" drawable="ic_menu_agenda" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="/(tabs)/newTraining" disableScrollToTop>
				<Label>Тренировка</Label>
				<Icon sf="globe" drawable="ic_menu_compass" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="/(tabs)/profile">
				<Label>Профиль</Label>
				<Icon sf="person" drawable="ic_menu_myplaces" />
				<Badge>+9</Badge>
			</NativeTabs.Trigger>
		</NativeTabs>
	)
}
