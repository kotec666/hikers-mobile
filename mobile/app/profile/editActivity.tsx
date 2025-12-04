import React, { useEffect, useState } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import HeaderBack from '@/components/ui/HeaderBack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
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
				if (!Boolean(newActivitiesOrder?.length)) {
					setNewActivitiesOrder(activities)
				}
			} catch (e) {
				const errors = await e.response.json()
				console.log(errors)
				getFieldsErrors(errors)
			}
		})()
	}, [])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Container className="gap-[20px]">
					<HeaderBack>Топ 3 активности на показ</HeaderBack>
				</Container>
				{Boolean(data.activities?.length) && <ActivityInfo activities={data.activities || []} isChooseMode />}
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

export default ProfileEditActivity
