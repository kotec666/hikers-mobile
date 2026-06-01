import React from 'react'
import AnimatedResumeWithCircleSvg from '@/components/svg/AnimatedResumeWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'
import { PathProps } from 'react-native-svg/src/elements/Path'

interface Props {
	position?: IPoint | null
	color?: string
	animatedPathProps?: Partial<PathProps>
}

const RNMapsAnimatedResumeLocationMarker = ({ position, color, animatedPathProps }: Props) => {
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
			<AnimatedResumeWithCircleSvg color={color} animatedPathProps={animatedPathProps} />
		</Marker>
	)
}

export default RNMapsAnimatedResumeLocationMarker
