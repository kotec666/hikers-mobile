import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import FinishWithCircleSvg from '@/components/svg/FinishWithCircleSvg'

interface Props {
	position?: Point | null
}

const FinishLocationMarker = ({ position }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={5}>
			<View>
				<FinishWithCircleSvg />
			</View>
		</Marker>
	)
}

export default FinishLocationMarker
