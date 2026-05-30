import React from 'react'
import ResumeWithCircleSvg from '@/components/svg/ResumeWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

interface Props {
	position?: IPoint | null
	color?: string
}

const RNMapsResumeLocationMarker = ({ position, color }: Props) => {
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
			<ResumeWithCircleSvg color={color} />
		</Marker>
	)
}

export default RNMapsResumeLocationMarker
