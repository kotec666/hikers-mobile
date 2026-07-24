'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useMediaQuery } from '@/hooks/use-media-query'
import PhoneScene from '@/components/main-page/phone-scene'
import { Stats } from '@react-three/drei'

const PhoneSceneWrapper = () => {
	const isDesktop = useMediaQuery('(min-width: 1024px)')
	return (
		<Canvas camera={{ position: [0, 0, 5], fov: 3 }}>
			{isDesktop && <PhoneScene />}
			<Stats />
		</Canvas>
	)
}

export default PhoneSceneWrapper
