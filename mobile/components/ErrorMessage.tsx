import React, { useEffect, useRef } from 'react'
import { Animated, Text } from 'react-native'
import { Container } from '@/components/ui/Container'
import { fontFamily } from '@/constants/Fonts'

interface ErrorMessageProps {
	error?: string | boolean
}

const ErrorMessage = ({ error }: ErrorMessageProps) => {
	const opacity = useRef(new Animated.Value(0)).current
	const height = useRef(new Animated.Value(0)).current

	useEffect(() => {
		if (error) {
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 250,
					useNativeDriver: false
				}),
				Animated.timing(height, {
					toValue: 24,
					duration: 300,
					useNativeDriver: false
				})
			]).start()
		} else {
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 0,
					duration: 250,
					useNativeDriver: false
				}),
				Animated.timing(height, {
					toValue: 0,
					duration: 300,
					useNativeDriver: false
				})
			]).start()
		}
	}, [error, height, opacity])

	return (
		<Animated.View
			style={{
				marginTop: 10,
				overflow: 'hidden',
				opacity,
				height
			}}
		>
			<Container>
				<Text
					style={{
						color: 'red',
						fontSize: 14,
						fontFamily: fontFamily.regular
					}}
				>
					{typeof error === 'string' ? error : error ? 'Ошибка' : ''}
				</Text>
			</Container>
		</Animated.View>
	)
}

export default ErrorMessage
