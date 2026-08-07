import React, { useCallback, useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { useMyActivitiesQuery } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import { ActivityListSkeleton } from '@/components/ui/skeleton'
import { View } from 'react-native'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { useTranslation } from 'react-i18next'

const ProfileEditActivity = () => {
	const { t } = useTranslation()
	const { setNewActivitiesOrder, newActivitiesOrder } = useEditActivitiesStore()
	const { data: activities = [], isLoading, isError, refetch } = useMyActivitiesQuery()

	const handleRetryActivities = useCallback(() => {
		return refetch()
	}, [refetch])

	useEffect(() => {
		if (!activities?.length) return

		if (!newActivitiesOrder.length) {
			setNewActivitiesOrder(activities)
		}
	}, [newActivitiesOrder.length, setNewActivitiesOrder, activities])

	const activitiesToRender = newActivitiesOrder.length ? newActivitiesOrder : (activities ?? [])

	return (
		<Page>
			<Container className="gap-[20px]">
				<HeaderBack>{t('EditProfilePage.topThreeActivity')}</HeaderBack>
			</Container>

			{isError && activities.length <= 0 ? (
				<View className="flex-1 items-center justify-center px-4">
					<LoadQueryErrorRetry
						text={t('LoadQueryErrorRetry.label.failedToLoadActivity')}
						buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
						onRetry={handleRetryActivities}
					/>
				</View>
			) : isLoading ? (
				<View style={{ marginTop: 15, paddingHorizontal: 5 }}>
					<ActivityListSkeleton isEdit count={6} columns={3} />
				</View>
			) : (
				<ActivityInfo activities={activitiesToRender} isChooseMode />
			)}
		</Page>
	)
}

export default ProfileEditActivity
