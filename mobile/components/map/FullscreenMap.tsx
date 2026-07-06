import React, { useMemo } from 'react'
import { Modal, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CloseFullscreenModeButton from '@/components/ui/CloseFullscreenModeButton'
import { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'
import { IRNMapWorkoutProps } from '@/components/map/RNMapWorkout'

interface Props {
	visible: boolean
	onClose: () => void
	map?: React.ReactElement<IYaMapWorkoutProps> | React.ReactElement<IRNMapWorkoutProps> | null
}

const FullscreenMap = ({ visible, onClose, map }: Props) => {
	const insets = useSafeAreaInsets()
	const isIOS = Platform.OS === 'ios'

	const mapComponent = useMemo(() => {
		if (!map) return null
		const yaMapProps: IYaMapWorkoutProps = {
			rounded: 0,
			bordered: false,
			interactiveDisabled: false,
			logoPosition: {
				horizontal: 'right',
				vertical: 'bottom'
			},
			logoPadding: {
				horizontal: 60,
				vertical: insets.bottom + 40
			}
		}

		const rnMapProps: IRNMapWorkoutProps = {
			rounded: 0,
			bordered: false,
			interactiveDisabled: false,
			appleLogoPosition: { top: 0, bottom: 40, left: 40, right: 0 },
			appleLegalPosition: { top: 0, bottom: 53, left: 100, right: 0 }
		}

		if (isIOS) {
			return React.cloneElement(map, rnMapProps)
		} else {
			return React.cloneElement(map, yaMapProps)
		}
	}, [map, insets.bottom, isIOS])

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
