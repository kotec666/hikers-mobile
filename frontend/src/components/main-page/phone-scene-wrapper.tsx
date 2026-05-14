'use client'
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useMediaQuery } from '@/hooks/use-media-query'
import dynamic from 'next/dynamic'

const PhoneScene = dynamic(async () => import('@/components/main-page/phone-scene'), { ssr: false })

interface PhoneSceneWrapperProps {
	containerRef: React.RefObject<HTMLDivElement | null>
}

const PhoneSceneWrapper = ({ containerRef }: PhoneSceneWrapperProps) => {
	const isDesktop = useMediaQuery('(min-width: 1024px)')

	return (
		<Canvas camera={{ position: [0, 0, 5], fov: 3 }}>
			{isDesktop && <PhoneScene containerRef={containerRef} />}
		</Canvas>
	)
}

export default PhoneSceneWrapper
