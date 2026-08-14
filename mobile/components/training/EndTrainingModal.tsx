import React, { memo } from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal/Modal'
import { useTranslation } from 'react-i18next'

interface IProps {
	open: boolean
	blurDisabled: boolean
	handleClose: () => void
	handleClickEnd: () => void
}

const EndTrainingModal = memo((props: IProps) => {
	const { t } = useTranslation()

	return (
		<Modal
			isOpen={props.open}
			blurDisabled={props.blurDisabled}
			handleClose={props.handleClose}
			label={t('WorkoutPage.finishWorkout')}
		>
			<View className="gap-[20px]">
				<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
					{t('common.actionCannotBeUndone')}
				</Text>
				<View className="flex-row gap-[10px]">
					<Button onPress={props.handleClickEnd} variant="white" buttonContainerClassName="flex-1">
						{t('common.yes')}
					</Button>
					<Button onPress={props.handleClose} variant="white" buttonContainerClassName="flex-1">
						{t('common.no')}
					</Button>
				</View>
			</View>
		</Modal>
	)
})

EndTrainingModal.displayName = 'EndTrainingModal'

export default EndTrainingModal
