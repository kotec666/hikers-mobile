import React from 'react'
import { Marker } from 'react-native-yamap-plus-lite'
import { View } from 'react-native'
import { ILatLng } from '@/components/map/MapComponent'
import ResumeWithCircleSvg from '@/components/svg/ResumeWithCircleSvg'

interface Props {
	position?: ILatLng | null
}

const ResumeLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={6}>
			<View>
				<ResumeWithCircleSvg />
			</View>
		</Marker>
	)
}

export default ResumeLocationMarker
