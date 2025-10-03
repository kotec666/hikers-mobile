import React from 'react'
import { Marker, MarkerRef, Circle } from 'react-native-yamap-plus-lite'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'

interface Props {
	position: { lat: number; lon: number }
	accuracy?: number
	userMarkerRef: React.RefObject<MarkerRef | null>
}

const UserLocationMarker = ({ position, accuracy = 10 }: Props) => {
	if (!position?.lat || !position?.lon) return null
	return (
		<>
			<Marker point={position} zIndex={6}>
				<View
					style={{
						width: 30,
						height: 30,
						borderRadius: 15,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<UserWithCircleSvg />
				</View>
			</Marker>

			<Circle
				center={position}
				radius={accuracy}
				fillColor="rgba(0,200,100,0.25)"
				strokeColor={Colors['green-main']}
				strokeWidth={2}
				zIndex={5}
			/>
		</>
	)
}

export default UserLocationMarker
