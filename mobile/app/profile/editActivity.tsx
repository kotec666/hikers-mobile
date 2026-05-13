import React, { useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { useMyActivitiesQuery } from '@/queries/my-profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { Page } from '@/components/ui/Page'

const ProfileEditActivity = () => {
	const { setNewActivitiesOrder, newActivitiesOrder } = useEditActivitiesStore()
	const { data: activities, isError, error } = useMyActivitiesQuery()

	useEffect(() => {
		if (!activities?.length) return

		if (!newActivitiesOrder.length) {
			setNewActivitiesOrder(activities)
		}
	}, [newActivitiesOrder.length, setNewActivitiesOrder, activities])

	useEffect(() => {
		if (!isError) return
		getFieldsErrors(error)
	}, [isError, error])

	const activitiesToRender = newActivitiesOrder.length ? newActivitiesOrder : (activities ?? [])
	return (
		<Page>
			<Container className="gap-[20px]">
				<HeaderBack>Топ 3 активности на показ</HeaderBack>
			</Container>
			<ActivityInfo activities={activitiesToRender} isChooseMode />
		</Page>
	)
}

export default ProfileEditActivity
