import React from 'react'
import FinishWithCircleSvg from '@/components/svg/FinishWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

interface Props {
	position?: IPoint | null
	color?: string
}

const RNMapsFinishLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker
			coordinate={{
				latitude: position.lat,
				longitude: position.lon
			}}
			style={{
				zIndex: 6
			}}
		>
			<FinishWithCircleSvg color={color} />
		</Marker>
	)
}

export default RNMapsFinishLocationMarker
