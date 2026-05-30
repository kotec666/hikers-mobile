import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import ResumeWithCircleSvg from '@/components/svg/ResumeWithCircleSvg'

interface Props {
	position?: Point | null
	color?: string
}

const YaMapResumeLocationMarker = ({ position, color }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<ResumeWithCircleSvg color={color} />
			</View>
		</Marker>
	)
}

export default YaMapResumeLocationMarker
