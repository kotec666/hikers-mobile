'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import PhoneScene from '@/components/main-page/phone-scene'

interface PhoneSceneWrapperProps {
	containerRef: React.RefObject<HTMLDivElement | null>
}

const PhoneSceneWrapper = ({ containerRef }: PhoneSceneWrapperProps) => {
	return (
		<Canvas camera={{ position: [0, 0, 5], fov: 4 }}>
			<PhoneScene containerRef={containerRef} />
		</Canvas>
	)
}

export default PhoneSceneWrapper
