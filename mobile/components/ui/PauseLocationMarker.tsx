import React from 'react'
import { Marker } from 'react-native-yamap-plus-lite'
import { View } from 'react-native'
import { ILatLng } from '@/components/map/MapComponent'
import PauseWithCircleSvg from '@/components/svg/PauseWithCircleSvg'

interface Props {
	position?: ILatLng | null
}

const PauseLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={6}>
			<View>
				<PauseWithCircleSvg />
			</View>
		</Marker>
	)
}

export default PauseLocationMarker
