'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import PhoneScene from '@/app/components/main-page/PhoneScene'

const PhoneSceneWrapper = () => {
	return (
		<Canvas camera={{ position: [0, 0, 5], fov: 4 }} shadows>
			<PhoneScene />
		</Canvas>
	)
}

export default PhoneSceneWrapper
