import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import { format } from 'date-fns'
import WorkoutHistoryListItem from '@/components/workout-history/WorkoutHistoryListItem'
import SaveUnsavedTrainingSvg from '@/components/svg/SaveUnsavedTrainingSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import { IWorkout } from '@/store/workoutStorage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { formatDistance } from '@/helpers/distance'
import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'
import { getSavedLngInStorage, locales } from '@/store/languageStorage'

interface IProps {
	notSavedWorkouts: IWorkout[]
	handleClickSaveOneWorkout: (startedAt: number) => void
	handleClickDelete: (startedAt: number) => void
	handleClickDeleteAll: () => void
	syncingIds: number[]
}

const UnsavedTrainingsDetails = ({
	notSavedWorkouts,
	handleClickSaveOneWorkout,
	handleClickDelete,
	handleClickDeleteAll,
	syncingIds
}: IProps) => {
	const { t, i18n } = useTranslation()

	const currentLanguage = getSavedLngInStorage()
	const currentLocale = locales[currentLanguage.lngShort]

	const insets = useSafeAreaInsets()

	const workoutTypeMap = useMemo(() => Object.fromEntries(WorkoutTypesData.map((t) => [t.type, t])), [])

	const renderItem = useCallback(
		({ item }: { item: IWorkout }) => {
			const date = new Date(item.startedAt)

			const titleDate = format(date, 'd MMMM, HH:mm', { locale: currentLocale })
			const title = `${titleDate}${
				Number.isFinite(item.distanceMeters) && item.distanceMeters >= 0
					? `, ${formatDistance(item.distanceMeters, i18n.language)}`
					: ''
			}`
			const typeData = workoutTypeMap[item.type]

			const IconComponent = typeData?.IconComponent ?? PeopleRunningSvg
			const isSyncing = syncingIds.includes(item.startedAt)

			return (
				<WorkoutHistoryListItem
					title={title}
					icon={<IconComponent width={26} height={26} />}
					isLoading={isSyncing}
					actionIcon={[
						{
							iconSvg: <SaveUnsavedTrainingSvg />,
							iconCb: () => handleClickSaveOneWorkout(item.startedAt),
							disabled: isSyncing
						},
						{
							iconSvg: <DeleteTrashSvg />,
							iconCb: () => handleClickDelete(item.startedAt),
							disabled: isSyncing
						}
					]}
				/>
			)
		},
		[currentLocale, handleClickDelete, handleClickSaveOneWorkout, i18n.language, syncingIds, workoutTypeMap]
	)

	const isDeletingDisabled = !notSavedWorkouts.length || syncingIds.length > 0

	// @TODO flex-1 ?
	return (
		<View className="flex-1 w-full p-[16px]">
			<FlashList
				data={notSavedWorkouts}
				renderItem={renderItem}
				keyExtractor={(item) => String(item.startedAt)}
				contentContainerStyle={{
					gap: 16,
					paddingBottom: insets.bottom + 100
				}}
				ListFooterComponent={
					<View style={{ marginTop: 20 }}>
						<Button variant="white" onPress={handleClickDeleteAll} disabled={isDeletingDisabled}>
							{t('WorkoutPage.bottomSheets.actions.deleteAll')}
						</Button>
					</View>
				}
			/>
		</View>
	)
}

export default UnsavedTrainingsDetails
