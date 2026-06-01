import React from 'react'
import PauseWithCircleSvg from '@/components/svg/PauseWithCircleSvg'
import { Marker } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

interface Props {
	position?: IPoint | null
	color?: string
	animatedFillProps?: Partial<{ fill: string }>
}

const RNMapsPauseLocationMarker = ({ position, color, animatedFillProps }: Props) => {
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
			<PauseWithCircleSvg color={color} animatedFillProps={animatedFillProps} />
		</Marker>
	)
}

export default RNMapsPauseLocationMarker
