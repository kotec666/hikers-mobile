import { Text } from 'react-native'
import { Page } from '@/components/ui/Page'
import { LinkCustom } from '@/components/ui/LinkCustom'
import { fontFamily } from '@/constants/Fonts'
import { useTranslation } from 'react-i18next'

export default function NotFoundScreen() {
	const { t } = useTranslation()
	return (
		<Page>
			<Text className="text-white text-lg" style={{ fontFamily: fontFamily.medium }}>
				{t('NotFoundPage.pageNotFound')}
			</Text>
			<LinkCustom href="/(tabs)/profile" text={t('NotFoundPage.backToProfile')} className="text-blue-3d" />
		</Page>
	)
}
