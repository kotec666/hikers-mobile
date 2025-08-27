import React from 'react'
import { Marker } from 'react-native-yamap-plus-lite'
import Svg, { Circle } from 'react-native-svg'
import UserSvg from '@/components/svg/UserSvg'

interface Props {
	position: { lat: number; lon: number }
	accuracy?: number
}

const UserLocationMarker = ({ position, accuracy = 10 }: Props) => {
	if (!position?.lat || !position?.lon) return null
	return (
		<Marker point={position} anchor={{ x: 0.5, y: 0.5 }}>
			<Svg width={120} height={120} viewBox="0 0 120 120">
				<Circle cx="60" cy="60" r="30" fill="rgba(0,200,100,0.25)" />
				<Circle cx="60" cy="60" r="15" fill="#00C864" />
				<UserSvg />
			</Svg>
		</Marker>
	)
}

export default UserLocationMarker
