import React, { useEffect, useState } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { getActivities, IActivity } from '@/api/activities'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'

const ProfileEditActivity = () => {
	const insets = useSafeAreaInsets()
	const { setNewActivitiesOrder, newActivitiesOrder } = useEditActivitiesStore()

	const [data, setData] = useState<{
		activities?: IActivity[]
	}>({
		activities: undefined
	})

	useEffect(() => {
		;(async () => {
			try {
				const activities = await getActivities()
				setData((s) => ({ ...s, activities }))
				if (!newActivitiesOrder.length && activities.length) {
					setNewActivitiesOrder(activities)
				}
			} catch (e: unknown) {
				await getFieldsErrors(e)
			}
		})()
	}, [newActivitiesOrder.length, setNewActivitiesOrder])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px]">
				<HeaderBack>Топ 3 активности на показ</HeaderBack>
			</Container>
			<ActivityInfo
				activities={newActivitiesOrder.length ? newActivitiesOrder : data.activities || []}
				isChooseMode
			/>
		</SafeAreaProvider>
	)
}

export default ProfileEditActivity
