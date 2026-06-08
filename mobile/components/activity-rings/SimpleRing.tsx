import React, { useMemo } from 'react'
import Svg, { Circle } from 'react-native-svg'
import { Colors } from '@/constants/Colors'

interface IProps {
	progress: number
	color?: string
	size?: number
}

const SimpleRing = ({ progress, color = Colors['green-main'], size = 30 }: IProps) => {
	const strokeWidth = useMemo(() => size * 0.1, [size])
	const center = useMemo(() => size / 2, [size])
	const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
	const circumference = useMemo(() => 2 * Math.PI * radius, [radius])
	const filledLength = useMemo(() => (progress / 100) * circumference, [progress, circumference])

	return (
		<Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
			{/* Background ring */}
			<Circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke={Colors['gray-ff1a']}
				strokeWidth={strokeWidth}
			/>
			{/* Progress */}
			<Circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={`${filledLength} ${circumference}`}
			/>
		</Svg>
	)
}

export default SimpleRing
