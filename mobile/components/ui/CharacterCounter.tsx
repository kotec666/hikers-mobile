import React, { useEffect, useState } from 'react'
import { View, Animated } from 'react-native'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { Colors } from '@/constants/Colors'

interface Props {
	valueLength: number
	maxLength: number
}

export function CharacterCounter({ valueLength, maxLength }: Props) {
	const radius = 12
	const strokeWidth = 2
	const circumference = 2 * Math.PI * radius

	const remaining = maxLength - valueLength

	const isNearLimit = remaining <= 20 && remaining > 0
	const isAtLimit = remaining === 0
	const isOverflow = remaining < 0

	const progress = Math.min(valueLength / maxLength, 1)
	const strokeDashoffset = circumference - circumference * progress

	let strokeColor = Colors['green-main']
	if (isNearLimit) strokeColor = Colors['yellow-main']
	if (isAtLimit || isOverflow) strokeColor = Colors['red-ff']

	const [scaleAnim] = useState(() => new Animated.Value(1))

	useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: isNearLimit || isAtLimit || isOverflow ? 1.2 : 1,
			useNativeDriver: true,
			friction: 5,
			tension: 150
		}).start()
	}, [isNearLimit, isAtLimit, isOverflow, scaleAnim])

	return (
		<View className="flex-row items-center gap-[6px]">
			<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
				<Svg width={30} height={30}>
					{/* background */}
					<Circle
						stroke={Colors['black-44']}
						fill="none"
						cx="15"
						cy="15"
						r={radius}
						strokeWidth={strokeWidth}
					/>

					{/* progress */}
					<Circle
						stroke={strokeColor}
						fill="none"
						cx="15"
						cy="15"
						r={radius}
						strokeWidth={strokeWidth}
						strokeDasharray={`${circumference} ${circumference}`}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
					/>

					{/* text */}
					{(isNearLimit || isAtLimit || isOverflow) && (
						<SvgText
							x="50%"
							y="50%"
							textAnchor="middle"
							dy="4"
							fontSize="10"
							fill={isAtLimit || isOverflow ? Colors['red-ff'] : Colors['black-5c']}
						>
							{remaining}
						</SvgText>
					)}
				</Svg>
			</Animated.View>
		</View>
	)
}
