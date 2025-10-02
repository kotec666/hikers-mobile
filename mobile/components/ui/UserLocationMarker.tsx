import React, { useEffect, useRef, useState } from 'react'
import { Marker, MarkerRef, Circle } from 'react-native-yamap-plus-lite'
import { StyleSheet, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'

interface Props {
	position: { lat: number; lon: number }
	accuracy?: number
}

const UserLocationMarker = ({ position, accuracy = 10 }: Props) => {
	const markerRef = useRef<MarkerRef | null>(null)

	useEffect(() => {
		;(() => {
			// @TODO как это анимировать?
			markerRef?.current?.animatedMoveTo({ lat: 53.422506, lon: 49.4781051 }, 5)
			markerRef?.current?.animatedRotateTo(150, 2)
		})()
	}, [markerRef.current])

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
					{/*<UserSvg*/}
					{/*	// style={{*/}
					{/*	// 	backgroundColor: Colors['green-main'],*/}
					{/*	// 	width: 32,*/}
					{/*	// 	height: 32,*/}
					{/*	// 	borderRadius: 16,*/}
					{/*	// 	padding: 10*/}
					{/*	// }}*/}
					{/*	width={16}*/}
					{/*	height={16}*/}
					{/*/>*/}
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
// 		<Marker
// 			point={position}
// 			anchor={{ x: 0.2, y: 0.2 }}
// 			ref={markerRef}
// 			handled={false}
// 			source={require('@/assets/images/carousel/carousel-2.webp')}
// 			visible={true}
// 		>
// 			<Svg width={120} height={120} viewBox="0 0 120 120">
// 				<Circle cx="60" cy="60" r="30" fill="rgba(0,200,100,0.25)" />
// 				<Circle cx="60" cy="60" r="15" fill="#00C864" />
// 				<UserSvg />
// 			</Svg>
// 		</Marker>
// 	)
// }

const styles = StyleSheet.create({
	markerContainer: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center'
	},
	circleBackground: {
		position: 'absolute',
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: Colors['green-main']
	},
	iconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 30,
		height: 30
	}
})

export default UserLocationMarker
