import React from 'react'
import { Marker, Point } from 'react-native-yamap-plus'
import { Text } from 'react-native'
import Svg from 'react-native-svg'

interface Props {
	position?: Point | null
	debugInfo?: string
}

const DebugMarker = ({ position, debugInfo }: Props) => {
	if (!position?.lat || !position?.lon) return null

	return (
		<Marker point={position} zIndex={20}>
			<Svg
				width={50}
				height={50}
				viewBox={`0 0 ${50} ${50}`}
				style={{
					width: 50,
					height: 50
				}}
			>
				<Text className="text-red-500">{debugInfo}</Text>
			</Svg>
		</Marker>
	)
}

export default DebugMarker
