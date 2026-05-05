'use client'
import React, { Suspense, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Environment } from '@react-three/drei'
import { ScreenTextureURL, screenTextureURLs } from '@/consts/PhoneScreenTextures'
import { useScroll, useTransform } from 'framer-motion'
import { PhoneModel } from '@/app/components/main-page/PhoneModel'
import * as THREE from 'three'

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
				castShadow
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-near={0.1}
				shadow-camera-far={50}
			/>
			<directionalLight
				// ref={dirLight2}
				position={[-5, 5, -5]}
				intensity={2}
				// castShadow
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-near={0.1}
				shadow-camera-far={50}
			/>
		</>
	)
}

const PhoneScene = () => {
	const { scrollYProgress } = useScroll()
	const currentIndex = useRef(0)
	const phoneRef = useRef<THREE.Group>(null!)
	const [screenTextureURL, setScreenTextureURL] = useState<ScreenTextureURL>(screenTextureURLs[0])
	const hasSwitched = useRef(false)

	const rotationY = useTransform(
		scrollYProgress,
		[0, 1],
		[0, Math.PI * 2 * 3] // 3 полных оборота (по числу текстур)
	)

	useFrame(() => {
		if (!phoneRef.current) return

		const rot = rotationY.get()
		phoneRef.current.rotation.y = rot

		const normalized = rot % (Math.PI * 2)
		const isBack = normalized > Math.PI - 0.15 && normalized < Math.PI + 0.15

		if (isBack) {
			if (!hasSwitched.current) {
				hasSwitched.current = true

				currentIndex.current = (currentIndex.current + 1) % screenTextureURLs.length
				setScreenTextureURL(screenTextureURLs[currentIndex.current])
			}
		} else {
			hasSwitched.current = false
		}
	})

	// const handleChangeTexture = (texture: ScreenTextureURL) => {
	// 	setScreenTextureURL(texture)
	// }

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
			{/* <OrbitControls /> */}
		</>
		// {/*<div className="w-full flex justify-center gap-5">*/}
		// {/*	<button*/}
		// {/*		className="border border-black rounded-sm p-2"*/}
		// {/*		onClick={() => handleChangeTexture(screenTextureURLs[0])}*/}
		// {/*	>*/}
		// {/*		set texture 1*/}
		// {/*	</button>*/}
		// {/*	<button*/}
		// {/*		className="border border-black rounded-sm p-2"*/}
		// {/*		onClick={() => handleChangeTexture(screenTextureURLs[1])}*/}
		// {/*	>*/}
		// {/*		set texture 2*/}
		// {/*	</button>*/}
		// {/*	<button*/}
		// {/*		className="border border-black rounded-sm p-2"*/}
		// {/*		onClick={() => handleChangeTexture(screenTextureURLs[2])}*/}
		// {/*	>*/}
		// {/*		set texture 3*/}
		// {/*	</button>*/}
		// {/*</div>*/}
	)
}

export default PhoneScene
