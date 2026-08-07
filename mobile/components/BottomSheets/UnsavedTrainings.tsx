import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { getNoun } from '@/helpers/getNoun'
import { useTranslation } from 'react-i18next'

interface IProps {
	isSaving: boolean
	handleClickSave: () => void
	handleClickDelete: () => void
	handleClickClose: () => void
	handleClickDetails: () => void
	unsavedTrainingsCount: number
}

const UnsavedTrainings = (props: IProps) => {
	const { t } = useTranslation()

	const { number, word } = getNoun(
		props.unsavedTrainingsCount,
		'WorkoutPage.bottomSheets.unsavedTrainings.noun.one',
		'WorkoutPage.bottomSheets.unsavedTrainings.noun.two',
		'WorkoutPage.bottomSheets.unsavedTrainings.noun.five'
	)

	const [adj, noun] = word.split(' ')

	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				{props.unsavedTrainingsCount === 1 ? (
					<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
						{t('WorkoutPage.bottomSheets.unsavedTrainings.titleFull')}
					</Text>
				) : (
					<>
						<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
							{t('WorkoutPage.bottomSheets.unsavedTrainings.titleShort')} {number} {t(adj)}
						</Text>
						<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
							{t(noun)}
						</Text>
					</>
				)}
			</View>
			<View className="w-full gap-[10px]">
				{props.unsavedTrainingsCount === 1 ? (
					<>
						<Button
							variant="white"
							onPress={props.handleClickSave}
							isLoading={props.isSaving}
							disabled={props.isSaving}
						>
							{t('common.save')}
						</Button>
						<Button variant="white" onPress={props.handleClickDelete} disabled={props.isSaving}>
							{t('common.delete')}
						</Button>
						<Button variant="white" onPress={props.handleClickClose} disabled={props.isSaving}>
							{t('WorkoutPage.bottomSheets.actions.notNow')}
						</Button>
					</>
				) : (
					<>
						<Button
							variant="white"
							onPress={props.handleClickSave}
							isLoading={props.isSaving}
							disabled={props.isSaving}
						>
							{t('WorkoutPage.bottomSheets.actions.saveAll')}
						</Button>
						<Button
							variant="white"
							onPress={props.handleClickDetails}
							isLoading={props.isSaving}
							disabled={props.isSaving}
						>
							{t('WorkoutPage.bottomSheets.actions.details')}
						</Button>
						<Button variant="white" onPress={props.handleClickClose} disabled={props.isSaving}>
							{t('WorkoutPage.bottomSheets.actions.notNow')}
						</Button>
					</>
				)}
			</View>
		</View>
	)
}

export default UnsavedTrainings
