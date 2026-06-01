import React from 'react'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'
import { PathProps } from 'react-native-svg/src/elements/Path'
import AnimatedFinishWithCircleSvg from '@/components/svg/AnimatedFinishWithCircleSvg'

interface Props {
	position?: IPoint | null
	color?: string
	animatedPathProps?: Partial<PathProps>
}

const RNMapsAnimatedFinishLocationMarker = ({ position, color, animatedPathProps }: Props) => {
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
			<AnimatedFinishWithCircleSvg color={color} animatedPathProps={animatedPathProps} />
		</Marker>
	)
}

export default RNMapsAnimatedFinishLocationMarker
