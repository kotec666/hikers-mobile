import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { Keyboard } from 'react-native'

export const useKeyboardHeight = () => {
	const [keyboardHeight, setKeyboardHeight] = useState(0)

	useFocusEffect(
		useCallback(() => {
			const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
				const height = event.endCoordinates?.height ?? 0
				setKeyboardHeight(height)
			})

			const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
				setKeyboardHeight(0)
			})

			return () => {
				showSubscription.remove()
				hideSubscription.remove()
			}
		}, [])
	)

	return keyboardHeight
}
