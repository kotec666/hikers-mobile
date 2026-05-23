import { Text } from 'react-native'
import { Page } from '@/components/ui/Page'
import { LinkCustom } from '@/components/ui/LinkCustom'
import { fontFamily } from '@/constants/Fonts'

export default function NotFoundScreen() {
	return (
		<Page>
			<Text className="text-white text-lg" style={{ fontFamily: fontFamily.medium }}>
				Такой страницы не существует.
			</Text>
			<LinkCustom href="/(tabs)/profile" text="Вернуться в профиль" className="text-blue-3d" />
		</Page>
	)
}
