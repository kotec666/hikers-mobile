import React from 'react'
import { Modal, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CloseFullscreenModeButton from '@/components/ui/CloseFullscreenModeButton'

interface Props {
	visible: boolean
	onClose: () => void
	map: React.ReactNode
}

const FullscreenMap = ({ visible, onClose, map }: Props) => {
	const insets = useSafeAreaInsets()

	if (!map) return null

	return (
		<Modal visible={visible} animationType="fade">
			<View style={{ flex: 1, backgroundColor: 'black' }}>
				{React.cloneElement(map as any, {
					interactiveDisabled: false,
					rounded: 0,
					logoPosition: { horizontal: 'right', vertical: 'bottom' },
					logoPadding: { horizontal: 60, vertical: insets.bottom + 20 },
					maxContainerHeight: undefined,
					maxMapHeight: undefined,
					deferInitialRouteRender: false
				})}

				<CloseFullscreenModeButton insetTop={insets.top} onPress={onClose} />
			</View>
		</Modal>
	)
}

export default FullscreenMap
