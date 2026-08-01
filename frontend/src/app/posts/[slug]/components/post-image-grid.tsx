'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Maximize2 } from 'lucide-react'
import { PATH_TO_IMAGE } from '@/consts/PATH_TO_FILES'
import { ImageLightbox } from '@/components/ui/lightbox/image-lightbox'
import { cn } from '@/lib/utils'

type LayoutItem = {
	className: string
	showOverlay?: boolean
	overlayText?: string
}

const getLayout = (count: number): LayoutItem[] => {
	if (count === 1) {
		return [{ className: 'col-span-2 row-span-2 h-96' }]
	}

	if (count === 2) {
		return [{ className: 'h-64' }, { className: 'h-64' }]
	}

	if (count === 3) {
		return [{ className: 'col-span-2 row-span-2 h-96' }, { className: 'h-48' }, { className: 'h-48' }]
	}

	if (count === 4) {
		return new Array(4).fill({ className: 'h-48' })
	}

	// 5+
	return [
		{ className: 'col-span-2 row-span-2 h-96' },
		{ className: 'h-48' },
		{ className: 'h-48' },
		{ className: 'h-48' },
		{
			className: 'h-48',
			showOverlay: true,
			overlayText: `+${count - 5}`
		}
	]
}

const getGridClass = (count: number) => (count === 1 ? 'grid-cols-1' : 'grid-cols-2')

interface PostImageGridProps {
	fileNames: string[]
	altPrefix?: string
}

/**
 * Renders the post's photo grid and owns the lightbox open/index state.
 * Kept as its own Client Component so the parent WorkoutPost (and the
 * post page above it) can remain Server Components.
 */
export function PostImageGrid({ fileNames, altPrefix = 'Тренировка' }: PostImageGridProps) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

	const count = fileNames.length
	if (count === 0) return null

	const layout = getLayout(count)
	const imageUrls = fileNames.map((fileName) => `${PATH_TO_IMAGE}${fileName}`)

	return (
		<>
			<div className={cn('px-4 pb-4 grid gap-2', getGridClass(count))}>
				{layout.map((item, idx) => {
					const img = fileNames[idx]

					return (
						<button
							key={idx}
							type="button"
							onClick={() => setLightboxIndex(idx)}
							aria-label={`Открыть фото ${idx + 1} на весь экран`}
							className={cn(
								'group relative overflow-hidden rounded-xl p-0 border-0 bg-transparent block cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
								item.className
							)}
						>
							<Image
								fill
								src={`${PATH_TO_IMAGE}${img}`}
								alt={`${altPrefix} ${idx + 1}`}
								loading="eager"
								className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
							/>

							{item.showOverlay ? (
								<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
									<span className="text-white text-xl font-semibold">{item.overlayText}</span>
								</div>
							) : (
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
									<Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" />
								</div>
							)}
						</button>
					)
				})}
			</div>

			<ImageLightbox
				images={imageUrls}
				initialIndex={lightboxIndex ?? 0}
				open={lightboxIndex !== null}
				onOpenChange={(open) => !open && setLightboxIndex(null)}
				getAlt={(i) => `${altPrefix} ${i + 1}`}
			/>
		</>
	)
}
