'use client'
import dynamic from 'next/dynamic'

const PhoneSceneWrapper = dynamic(() => import('@/components/main-page/phone-scene-wrapper'), {
	ssr: false
})

export default function PhoneSceneLazy() {
	return <PhoneSceneWrapper />
}
