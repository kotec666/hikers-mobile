import React, { useEffect } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { useMyActivitiesQuery } from '@/queries/my-profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

const ProfileEditActivity = () => {
	const insets = useSafeAreaInsets()
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
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px]">
				<HeaderBack>Топ 3 активности на показ</HeaderBack>
			</Container>
			<ActivityInfo activities={activitiesToRender} isChooseMode />
		</SafeAreaProvider>
	)
}

export default ProfileEditActivity
