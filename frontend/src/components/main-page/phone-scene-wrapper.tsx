'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useMediaQuery } from '@/hooks/use-media-query'
import dynamic from 'next/dynamic'
const PhoneScene = dynamic(async () => import('@/components/main-page/phone-scene'), { ssr: false })

const PhoneSceneWrapper = () => {
	const isDesktop = useMediaQuery('(min-width: 1024px)')

	return <Canvas camera={{ position: [0, 0, 5], fov: 3 }}>{isDesktop && <PhoneScene />}</Canvas>
}

export default PhoneSceneWrapper
