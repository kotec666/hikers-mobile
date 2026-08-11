'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useMediaQuery } from '@/hooks/use-media-query'
import PhoneScene from '@/components/main-page/phone-scene'
import { Stats } from '@react-three/drei'

const PhoneSceneWrapper = () => {
	const isDesktop = useMediaQuery('(min-width: 1024px)')
	return (
		<Canvas
			dpr={[1, 1.5]}
			gl={{
				powerPreference: 'high-performance',
				toneMappingExposure: 1
			}}
			camera={{ position: [0, 0, 5], fov: 3 }}
		>
			{isDesktop && <PhoneScene />}
			{/* {process.env.NODE_ENV === 'development' && <Stats />} */}
			<Stats />
		</Canvas>
	)
}

export default PhoneSceneWrapper
