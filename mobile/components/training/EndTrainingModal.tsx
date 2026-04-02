import React, { memo } from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal/Modal'
import { debounce } from '@/helpers/debounce'

interface IProps {
	open: boolean
	blurDisabled: boolean
	handleClose: () => void
	handleClickEnd: () => void
}

const EndTrainingModal = memo((props: IProps) => {
	const endDebounced = debounce(props.handleClickEnd, 300)

	return (
		<Modal
			isOpen={props.open}
			blurDisabled={props.blurDisabled}
			handleClose={props.handleClose}
			label="Вы действительно хотите завершить тренировку?"
		>
			<View className="gap-[20px]">
				<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
					Это действие нельзя отменить
				</Text>
				<View className="flex-row gap-[10px]">
					<Button onPress={endDebounced} variant="white" buttonContainerClassName="flex-1">
						Да
					</Button>
					<Button onPress={props.handleClose} variant="white" buttonContainerClassName="flex-1">
						Нет
					</Button>
				</View>
			</View>
		</Modal>
	)
})

EndTrainingModal.displayName = 'EndTrainingModal'

export default EndTrainingModal
