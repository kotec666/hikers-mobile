import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import PauseWithCircleSvg from '@/components/svg/PauseWithCircleSvg'

interface Props {
	position?: Point | null
	color?: string
}

const PauseLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<PauseWithCircleSvg color={color} />
			</View>
		</Marker>
	)
}

export default PauseLocationMarker
