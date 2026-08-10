'use client'
import * as THREE from 'three'
import React, { Suspense, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'
import { useScroll, useTransform } from 'framer-motion'
import { PhoneModel } from '@/components/main-page/phone-model'
import { useMotionValueEvent } from 'framer-motion'

const Lights = () => {
	// const dirLight1 = useRef<THREE.DirectionalLight>(null!)
	// const dirLight2 = useRef<THREE.DirectionalLight>(null!)
	// const dirLight3 = useRef<THREE.DirectionalLight>(null!)

	// useHelper(dirLight1, THREE.DirectionalLightHelper, 1)
	// useHelper(dirLight2, THREE.DirectionalLightHelper, 1)
	// useHelper(dirLight3, THREE.DirectionalLightHelper, 1)

	return (
		<>
			<hemisphereLight args={['#ffffff', '#5a5a5a', 2.2]} />
			<ambientLight intensity={1} />
			<directionalLight
				// ref={dirLight1}
				position={[5, 5, 5]}
				intensity={3}
			/>
			<directionalLight
				// ref={dirLight2}
				position={[-5, 5, -5]}
				intensity={4}
			/>
			<directionalLight
				// ref={dirLight3}
				position={[0, -4, 4]}
				intensity={1.8}
			/>
		</>
	)
}

const PhoneScene = () => {
	const phoneSceneContainer = useMemo(() => {
		return document.getElementById('phone-scene-container')
	}, [])

	const { scrollYProgress } = useScroll({
		target: { current: phoneSceneContainer },
		offset: ['start start', 'end end']
	})
	const phoneRef = useRef<THREE.Group>(null!)
	const currentTextureIndex = useRef(0)

	const [screenTextureURL, setScreenTextureURL] = useState<ScreenTextureURL>(screenTextureURLs[0])

	const rotationY = useTransform(
		scrollYProgress,
		[-0.5, 1],
		[0, Math.PI * 2 * 3] // 3 полных оборота (по числу текстур)
	)

	const isMacOS = useMemo(() => {
		if (typeof window === 'undefined') return false

		//@ts-expect-error userAgentData почему-то не существует в интерфейсе
		const platform = navigator.userAgentData?.platform || navigator.userAgent

		return /mac|iphone|ipad|ipod/i.test(platform)
	}, [])

	useFrame((_, delta) => {
		if (!phoneRef.current) return

		if (isMacOS) {
			phoneRef.current.rotation.y = THREE.MathUtils.lerp(
				phoneRef.current.rotation.y,
				rotationY.get(),
				1 - Math.exp(-8 * delta)
			)
		} else {
			phoneRef.current.rotation.y = rotationY.get()
		}
	})

	useMotionValueEvent(scrollYProgress, 'change', (latest) => {
		let textureIndex = 0

		if (latest >= 0.26 && latest < 0.75) {
			textureIndex = 1
		} else if (latest >= 0.75) {
			textureIndex = 2
		}

		if (currentTextureIndex.current !== textureIndex) {
			currentTextureIndex.current = textureIndex
			setScreenTextureURL(screenTextureURLs[textureIndex])
		}
	})

	return (
		<>
			{/*<axesHelper args={[100]} />*/}
			<Lights />
			<Suspense fallback={null}>
				<PhoneModel ref={phoneRef} screenTextureURL={screenTextureURL} />
			</Suspense>
			<AdaptiveDpr pixelated />
			<AdaptiveEvents />
		</>
	)
}

export default PhoneScene
