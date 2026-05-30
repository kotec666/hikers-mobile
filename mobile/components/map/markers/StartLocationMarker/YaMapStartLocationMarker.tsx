import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import StartWithCircleSvg from '@/components/svg/StartWithCircleSvg'

interface Props {
	position?: Point | null
	color?: string
}

const YaMapStartLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<StartWithCircleSvg color={color} />
			</View>
		</Marker>
	)
}

export default YaMapStartLocationMarker
