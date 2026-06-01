import React from 'react'
import AnimatedStartWithCircleSvg from '@/components/svg/AnimatedStartWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'
import { CircleProps } from 'react-native-svg'

interface Props {
	position?: IPoint | null
	color?: string
	animatedCircleProps?: Partial<CircleProps>
}

const RNMapsAnimatedStartLocationMarker = ({ position, color, animatedCircleProps }: Props) => {
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
			<AnimatedStartWithCircleSvg color={color} animatedCircleProps={animatedCircleProps} />
		</Marker>
	)
}

export default RNMapsAnimatedStartLocationMarker
