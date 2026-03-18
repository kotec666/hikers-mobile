'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./MapComponentClient'), {
	ssr: false
})

export default MapComponent
