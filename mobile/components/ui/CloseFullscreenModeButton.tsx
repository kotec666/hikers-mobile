import React from 'react'
import { Colors } from '@/constants/Colors'
import { Feather } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'

const CloseFullscreenModeButton = ({ onPress, insetTop = 0 }: { onPress?: () => void; insetTop?: number }) => {
	return (
		<TouchableOpacity
			activeOpacity={0.9}
			onPress={onPress}
			style={{
				position: 'absolute',
				top: insetTop + 20,
				right: 20,
				zIndex: 1000,
				width: 40,
				height: 40,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: Colors['black-25'],
				borderRadius: 4
			}}
		>
			<Feather name="x" size={20} color="white" />
		</TouchableOpacity>
	)
}

export default CloseFullscreenModeButton
