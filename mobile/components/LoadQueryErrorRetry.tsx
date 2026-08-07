import React from 'react'
import { Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { fontFamily } from '@/constants/Fonts'

interface LoadQueryErrorRetryProps {
	text: string
	buttonText: string
	onRetry: () => void
}

const LoadQueryErrorRetry = ({ text, buttonText, onRetry }: LoadQueryErrorRetryProps) => {
	return (
		<View className="items-center gap-4 py-10">
			<Text className="text-base text-white text-center" style={{ fontFamily: fontFamily.medium }}>
				{text}
			</Text>
			<Button variant="white" onPress={onRetry}>
				{buttonText}
			</Button>
		</View>
	)
}

export default LoadQueryErrorRetry
