import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal/Modal'
import { useTranslation } from 'react-i18next'

interface IProps {
	open: boolean
	handleClose: () => void
	handleClickDeletePost: () => void
}

const DeletePostModal = (props: IProps) => {
	const { t } = useTranslation()

	return (
		<Modal
			blurDisabled
			isOpen={props.open}
			handleClose={props.handleClose}
			label={t('PostDetailsPage.deletePostModal.label')}
		>
			<View className="gap-[20px]">
				<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
					{t('common.actionCannotBeUndone')}
				</Text>
				<View className="flex-row gap-[10px]">
					<Button onPress={props.handleClickDeletePost} variant="white" buttonContainerClassName="flex-1">
						{t('common.yes')}
					</Button>
					<Button onPress={props.handleClose} variant="white" buttonContainerClassName="flex-1">
						{t('common.no')}
					</Button>
				</View>
			</View>
		</Modal>
	)
}

export default DeletePostModal
