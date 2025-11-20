import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import ResumeWithCircleSvg from '@/components/svg/ResumeWithCircleSvg'

interface Props {
	position?: Point | null
}

const ResumeLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<ResumeWithCircleSvg />
			</View>
		</Marker>
	)
}

export default ResumeLocationMarker
