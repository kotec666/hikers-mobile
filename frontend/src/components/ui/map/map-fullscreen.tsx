'use client'

import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { MapProvider } from '@/components/providers/map-provider'
import YandexMap from '@/components/ui/map/yandex-map'
import { FullscreenViewer } from '@/components/ui/lightbox/fullscreen-viewer'
import { ITrainingPoint } from '@/api/workout'

interface MapFullscreenTriggerProps {
	points: ITrainingPoint[]
	routeColor?: string
}

/**
 * Small "expand" button placed over the inline map preview. Opens a fresh,
 * full-size instance of the map (rather than resizing the existing one),
 * which sidesteps any Yandex Maps container-resize edge cases entirely.
 */
export function MapFullscreenTrigger({ points, routeColor }: MapFullscreenTriggerProps) {
	const [open, setOpen] = useState(false)

	if (!points.length) return null

	return (
		<>
			<button
				type="button"
				aria-label="Открыть карту на весь экран"
				onClick={() => setOpen(true)}
				className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 transition-all duration-150 backdrop-blur-md"
			>
				<Maximize2 className="w-4 h-4 text-white" strokeWidth={2} />
			</button>

			<FullscreenViewer open={open} onOpenChange={setOpen} title="Карта тренировки" className="bg-black">
				<div className="absolute inset-0">
					<MapProvider
						apiUrl={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY}&lang=ru_RU`}
					>
						<YandexMap className="w-full h-full" points={points} routeColor={routeColor} />
					</MapProvider>
				</div>
			</FullscreenViewer>
		</>
	)
}
