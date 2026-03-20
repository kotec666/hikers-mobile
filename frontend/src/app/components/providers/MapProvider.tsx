'use client'
import React, { createContext, useContext, useMemo, useState, memo } from 'react'
import ReactDOM from 'react-dom'
import Script from 'next/script'
import { ReactifiedModule } from '@yandex/ymaps3-types/reactify'

export type ReactifyApi = ReactifiedModule<typeof import('@yandex/ymaps3-types')>

type MountedMapsContextValue = {
	reactifyApi: ReactifyApi | null
}

export const MountedMapsContext = createContext<MountedMapsContextValue>({
	reactifyApi: null
})

interface MapProviderProps {
	children?: React.ReactNode
	apiUrl: string
}

const MapProviderInner: React.FC<MapProviderProps> = ({ children, apiUrl }) => {
	const [reactifyApi, setReactifyApi] = useState<ReactifyApi | null>(null)

	const contextValue = useMemo(() => ({ reactifyApi }), [reactifyApi])

	return (
		<MountedMapsContext.Provider value={contextValue}>
			<Script
				src={apiUrl}
				onLoad={async () => {
					const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready])
					const reactify = ymaps3React.reactify.bindTo(React, ReactDOM)
					setReactifyApi(reactify.module(ymaps3))
				}}
			/>
			{children}
		</MountedMapsContext.Provider>
	)
}

export const MapProvider = memo(MapProviderInner, (prev, next) => prev.apiUrl === next.apiUrl)

export const useMap = () => useContext(MountedMapsContext)
