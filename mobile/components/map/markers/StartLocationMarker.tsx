import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import StartWithCircleSvg from '@/components/svg/StartWithCircleSvg'

interface Props {
	position?: Point | null
}

const StartLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<StartWithCircleSvg />
			</View>
		</Marker>
	)
}

export default StartLocationMarker
