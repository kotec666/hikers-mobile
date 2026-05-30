import React from 'react'
import StartWithCircleSvg from '@/components/svg/StartWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

interface Props {
	position?: IPoint | null
	color?: string
}

const RNMapsStartLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker
			// key_${item.longitude}_${item.latitude}
			coordinate={{
				latitude: position.lat,
				longitude: position.lon
			}}
			style={{
				zIndex: 5
			}}
		>
			<StartWithCircleSvg color={color} />
		</Marker>
	)
}

export default RNMapsStartLocationMarker
