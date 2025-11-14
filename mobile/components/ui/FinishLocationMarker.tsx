import React from 'react'
import { Marker } from 'react-native-yamap-plus'
import { View } from 'react-native'
import { ILatLng } from '@/components/map/MapComponent'
import FinishWithCircleSvg from '@/components/svg/FinishWithCircleSvg'

interface Props {
	position?: ILatLng | null
}

const FinishLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={6}>
			<View>
				<FinishWithCircleSvg />
			</View>
		</Marker>
	)
}

export default FinishLocationMarker
