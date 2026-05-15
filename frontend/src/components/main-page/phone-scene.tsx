'use client'
import * as THREE from 'three'
import React, { Suspense, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Environment } from '@react-three/drei'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'
import { useScroll, useTransform } from 'framer-motion'
import { PhoneModel } from '@/components/main-page/phone-model'
import { useMotionValueEvent } from 'framer-motion'

const Lights = () => {
	// const dirLight1 = useRef<THREE.DirectionalLight>(null!)
	// const dirLight2 = useRef<THREE.DirectionalLight>(null!)

	// useHelper(dirLight1, THREE.DirectionalLightHelper, 1)
	// useHelper(dirLight2, THREE.DirectionalLightHelper, 1)

	return (
		<>
			<directionalLight
				// ref={dirLight1}
				position={[5, 5, 5]}
				intensity={2}
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-near={0.1}
				shadow-camera-far={50}
			/>
			<directionalLight
				// ref={dirLight2}
				position={[-5, 5, -5]}
				intensity={2}
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-near={0.1}
				shadow-camera-far={50}
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

	const [screenTextureURL, setScreenTextureURL] = useState<ScreenTextureURL>(screenTextureURLs[0])

	const rotationY = useTransform(
		scrollYProgress,
		[-0.5, 1],
		[0, Math.PI * 2 * 3] // 3 полных оборота (по числу текстур)
	)

	useFrame(() => {
		if (!phoneRef.current) return
		phoneRef.current.rotation.y = rotationY.get()
	})

	useMotionValueEvent(scrollYProgress, 'change', (latest) => {
		let textureIndex = 0

		if (latest >= 0.26 && latest < 0.75) {
			textureIndex = 1
		} else if (latest >= 0.75) {
			textureIndex = 2
		}

		const nextTexture = screenTextureURLs[textureIndex]

		setScreenTextureURL((prev) => {
			if (prev === nextTexture) return prev
			return nextTexture
		})
	})

	return (
		<>
			{/*<axesHelper args={[100]} />*/}
			<Environment files={'/hdr/warehouse-256.hdr'} environmentIntensity={2} />
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
