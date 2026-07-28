import React, { useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { useMyActivitiesQuery } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import { ActivityListSkeleton } from '@/components/ui/skeleton'
import { View } from 'react-native'

const ProfileEditActivity = () => {
	const { setNewActivitiesOrder, newActivitiesOrder } = useEditActivitiesStore()
	const { data: activities = [], isLoading } = useMyActivitiesQuery()

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
				<HeaderBack>Топ 3 активности на показ</HeaderBack>
			</Container>

			{isLoading ? (
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
