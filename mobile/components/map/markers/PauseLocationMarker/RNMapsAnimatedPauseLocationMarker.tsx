import React from 'react'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'
import { PathProps } from 'react-native-svg/src/elements/Path'
import AnimatedPauseWithCircleSvg from '@/components/svg/AnimatedPauseWithCircleSvg'

interface Props {
	position?: IPoint | null
	color?: string
	animatedPathProps?: Partial<PathProps>
}

const RNMapsAnimatedPauseLocationMarker = ({ position, color, animatedPathProps }: Props) => {
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
			<AnimatedPauseWithCircleSvg color={color} animatedPathProps={animatedPathProps} />
		</Marker>
	)
}

export default RNMapsAnimatedPauseLocationMarker
