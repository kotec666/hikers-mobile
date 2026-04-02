import React, { createContext, PropsWithChildren, RefObject, useContext, useRef } from 'react'
import { View } from 'react-native'
import { BlurTargetView } from 'expo-blur'

type BlurContextType = RefObject<View | null>

const BlurContext = createContext<BlurContextType | undefined>(undefined)

export const useBlurContext = () => {
	const ctx = useContext(BlurContext)
	if (!ctx) {
		return undefined
		// throw new Error('useBlurContext должен быть использован с BlurProvider')
	}
	return ctx
}

const BlurProvider = ({ children }: PropsWithChildren) => {
	const blurTargetRef = useRef<View | null>(null)

	return (
		<BlurContext.Provider value={blurTargetRef}>
			<BlurTargetView ref={blurTargetRef} style={{ flex: 1, position: 'relative' }}>
				{children}
			</BlurTargetView>
		</BlurContext.Provider>
	)
}

export default BlurProvider
