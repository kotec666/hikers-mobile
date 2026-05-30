import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import FinishWithCircleSvg from '@/components/svg/FinishWithCircleSvg'

interface Props {
	position?: Point | null
	color?: string
}

const YaMapFinishLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={6}>
			<View>
				<FinishWithCircleSvg color={color} />
			</View>
		</Marker>
	)
}

export default YaMapFinishLocationMarker
