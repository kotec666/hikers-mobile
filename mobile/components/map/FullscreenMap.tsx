import React, { useMemo } from 'react'
import { Modal, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CloseFullscreenModeButton from '@/components/ui/CloseFullscreenModeButton'
import { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'

interface Props {
	visible: boolean
	onClose: () => void
	map: React.ReactElement<IYaMapWorkoutProps> // IRNMapWorkoutProps // @TODO проверить + доделать
}

const FullscreenMap = ({ visible, onClose, map }: Props) => {
	const insets = useSafeAreaInsets()

	const mapComponent = useMemo(() => {
		if (!map) return null

		return React.cloneElement(map, {
			rounded: 0,
			bordered: false,
			logoPosition: {
				horizontal: 'right',
				vertical: 'bottom'
			},
			logoPadding: {
				horizontal: 60,
				vertical: insets.bottom + 40
			}
		})
	}, [map, insets.bottom])

	if (!mapComponent) return null

	return (
		<Modal visible={visible} animationType="fade">
			<View style={{ flex: 1, backgroundColor: 'black' }}>
				{mapComponent}

				<CloseFullscreenModeButton insetTop={insets.top} onPress={onClose} />
			</View>
		</Modal>
	)
}

export default React.memo(FullscreenMap)
