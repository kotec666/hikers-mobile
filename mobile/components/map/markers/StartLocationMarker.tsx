import React from 'react'
import { Marker } from 'react-native-yamap-plus'
import { View } from 'react-native'
import { ILatLng } from '@/components/map/MapComponent'
import StartWithCircleSvg from '@/components/svg/StartWithCircleSvg'

interface Props {
	position?: ILatLng | null
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
