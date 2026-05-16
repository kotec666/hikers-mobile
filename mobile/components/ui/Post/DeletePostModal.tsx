import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal/Modal'

interface IProps {
	open: boolean
	handleClose: () => void
	handleClickDeletePost: () => void
}

const DeletePostModal = (props: IProps) => {
	return (
		<Modal
			blurDisabled
			isOpen={props.open}
			handleClose={props.handleClose}
			label="Вы действительно хотите удалить пост?"
		>
			<View className="gap-[20px]">
				<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
					Это действие нельзя отменить
				</Text>
				<View className="flex-row gap-[10px]">
					<Button onPress={props.handleClickDeletePost} variant="white" buttonContainerClassName="flex-1">
						Да
					</Button>
					<Button onPress={props.handleClose} variant="white" buttonContainerClassName="flex-1">
						Нет
					</Button>
				</View>
			</View>
		</Modal>
	)
}

export default DeletePostModal
