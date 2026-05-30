import React, { useMemo } from 'react'
import { Polyline } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

type PolylineRef = React.ComponentRef<typeof Polyline>
interface IRNSegmentPolylineProps {
	polylineRef?: React.RefObject<PolylineRef | null>
	color: string
	points: IPoint[]
}

const RNSegmentPolyline = ({ polylineRef, color, points }: IRNSegmentPolylineProps) => {
	const coordinates = useMemo(
		() =>
			points.map((p) => ({
				latitude: p.lat,
				longitude: p.lon
			})),
		[points]
	)

	return <Polyline ref={polylineRef} strokeWidth={4} strokeColor={color} coordinates={coordinates} />
}

export default RNSegmentPolyline
