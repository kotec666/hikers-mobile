import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import AchievementsStats from '@/components/ui/Profile/AchievementsStats'
import { IProfileAchievement } from '@/api/profile'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import { useTranslation } from 'react-i18next'

const RedirectAchievementsInfo = (props: {
	achievements?: IProfileAchievement[]
	isMyProfile?: boolean
	userId?: string
}) => {
	const { t } = useTranslation()
	const { push } = useSafeNavigation()

	const handleClickRedirect = () => {
		if (props.userId) {
			return push({
				pathname: '/user/achievements/[id]',
				params: { id: props.userId }
			})
		} else {
			return push('/achievements')
		}
	}

	if (!props.isMyProfile && !props.achievements?.length) return null
	return (
		<View className="gap-[15px]">
			<TouchableOpacity onPress={handleClickRedirect}>
				<View className="flex-row justify-between">
					<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
						{t('ProfilePage.achievements')}
					</Text>
					<ArrowDownSvg style={{ transform: [{ rotate: '-90deg' }] }} size={20} />
				</View>
			</TouchableOpacity>
			<View className="flex-row justify-between gap-[10px]">
				{Boolean(props.achievements?.length) &&
					props.achievements?.map((achievement) => (
						<AchievementsStats key={achievement.id} title={achievement.title} />
					))}
			</View>
		</View>
	)
}

export default RedirectAchievementsInfo
