'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FullscreenViewer } from './fullscreen-viewer'
import { cn } from '@/lib/utils'

const MIN_SCALE = 1
const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const SWIPE_THRESHOLD_RATIO = 0.2
const SWIPE_VELOCITY_THRESHOLD = 500

const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))

const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

const midpointOf = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
	x: (a.x + b.x) / 2,
	y: (a.y + b.y) / 2
})

interface ImageLightboxProps {
	images: string[]
	initialIndex: number
	open: boolean
	onOpenChange: (open: boolean) => void
	getAlt?: (index: number) => string
}

export function ImageLightbox({ images, initialIndex, open, onOpenChange, getAlt }: ImageLightboxProps) {
	const [index, setIndex] = useState(initialIndex)
	const [prevOpen, setPrevOpen] = useState(open)
	const activeThumbRef = useRef<HTMLButtonElement>(null)

	// Reset to whichever thumbnail was tapped every time the lightbox transitions to open.
	// Adjusted during render ("adjusting state when props change") instead of an effect,
	// so it lands in the same commit rather than triggering an extra render pass.
	if (open !== prevOpen) {
		setPrevOpen(open)
		if (open) setIndex(initialIndex)
	}

	// Keep the active thumbnail centered in the filmstrip as the slide changes.
	// This is a genuine external-system sync (imperative DOM scroll), so it stays an effect.
	useEffect(() => {
		activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
	}, [index])

	const goTo = useCallback(
		(next: number) => {
			if (next < 0 || next > images.length - 1) return
			setIndex(next)
		},
		[images.length]
	)

	useEffect(() => {
		if (!open) return
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') goTo(index + 1)
			if (e.key === 'ArrowLeft') goTo(index - 1)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open, index, goTo])

	return (
		<FullscreenViewer
			open={open}
			onOpenChange={onOpenChange}
			title="Просмотр фотографий"
			header={
				images.length > 1 ? (
					<span className="text-white/70 text-sm font-medium tabular-nums">
						{index + 1} / {images.length}
					</span>
				) : undefined
			}
		>
			<LightboxTrack images={images} index={index} onIndexChange={goTo} getAlt={getAlt} />

			{images.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Предыдущее фото"
						disabled={index === 0}
						onClick={() => goTo(index - 1)}
						className="hidden sm:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 disabled:opacity-0 disabled:pointer-events-none transition-all duration-150 backdrop-blur-md"
					>
						<ChevronLeft className="w-6 h-6 text-white" />
					</button>
					<button
						type="button"
						aria-label="Следующее фото"
						disabled={index === images.length - 1}
						onClick={() => goTo(index + 1)}
						className="hidden sm:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 disabled:opacity-0 disabled:pointer-events-none transition-all duration-150 backdrop-blur-md"
					>
						<ChevronRight className="w-6 h-6 text-white" />
					</button>
				</>
			)}

			{images.length > 1 && (
				<div
					className="hidden sm:flex absolute inset-x-0 bottom-0 z-10 justify-center px-4"
					style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
				>
					<div
						className="flex gap-2 px-3 py-2 max-w-full overflow-x-auto rounded-2xl bg-black/40 backdrop-blur-md [&::-webkit-scrollbar]:hidden"
						style={{ scrollbarWidth: 'none' }}
					>
						{images.map((src, i) => (
							<button
								key={`${src}-thumb-${i}`}
								ref={i === index ? activeThumbRef : undefined}
								type="button"
								onClick={() => goTo(i)}
								aria-label={`Перейти к фото ${i + 1}`}
								aria-current={i === index}
								className={cn(
									'relative shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200',
									i === index
										? 'ring-2 ring-white opacity-100'
										: 'opacity-45 hover:opacity-75 scale-95'
								)}
							>
								<Image src={src} alt="" fill sizes="56px" className="object-cover" />
							</button>
						))}
					</div>
				</div>
			)}
		</FullscreenViewer>
	)
}

interface LightboxTrackProps {
	images: string[]
	index: number
	onIndexChange: (index: number) => void
	getAlt?: (index: number) => string
}

type GestureMode = 'idle' | 'pan' | 'pinch' | 'swipe'

function LightboxTrack({ images, index, onIndexChange, getAlt }: LightboxTrackProps) {
	const reduceMotion = useReducedMotion()
	const containerRef = useRef<HTMLDivElement>(null)

	const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
	const [imageBox, setImageBox] = useState({ width: 0, height: 0 })
	const [prevIndex, setPrevIndex] = useState(index)
	const [scale, setScale] = useState(1)
	const [pan, setPan] = useState({ x: 0, y: 0 })
	const [dragX, setDragX] = useState(0)
	const [isSwiping, setIsSwiping] = useState(false)

	const pointersRef = useRef(new Map<number, { x: number; y: number }>())
	const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null)
	const gestureRef = useRef<{
		mode: GestureMode
		startX: number
		startY: number
		startTime: number
		panStart: { x: number; y: number }
		scaleStart: number
		pinchStartDist: number
		pinchStartMid: { x: number; y: number }
	}>({
		mode: 'idle',
		startX: 0,
		startY: 0,
		startTime: 0,
		panStart: { x: 0, y: 0 },
		scaleStart: 1,
		pinchStartDist: 0,
		pinchStartMid: { x: 0, y: 0 }
	})

	// Measure the viewport so we know how far the track needs to translate per slide
	useEffect(() => {
		const el = containerRef.current
		if (!el) return
		const measure = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight })
		measure()
		const ro = new ResizeObserver(measure)
		ro.observe(el)
		return () => ro.disconnect()
	}, [])

	// A fresh slide always starts at 1x. Adjusted during render instead of an effect
	// (see React's "adjusting state when a prop changes" pattern) — no extra commit.
	if (index !== prevIndex) {
		setPrevIndex(index)
		setScale(1)
		setPan({ x: 0, y: 0 })
	}

	const clampPan = useCallback(
		(next: { x: number; y: number }, s: number) => {
			const maxX = Math.max(0, (imageBox.width * s - containerSize.width) / 2)
			const maxY = Math.max(0, (imageBox.height * s - containerSize.height) / 2)
			return {
				x: Math.min(maxX, Math.max(-maxX, next.x)),
				y: Math.min(maxY, Math.max(-maxY, next.y))
			}
		},
		[imageBox, containerSize]
	)

	const handleDoubleTap = useCallback(
		(clientX: number, clientY: number) => {
			const rect = containerRef.current?.getBoundingClientRect()
			if (!rect) return

			if (scale > 1.01) {
				setScale(1)
				setPan({ x: 0, y: 0 })
				return
			}

			const originX = clientX - rect.left - rect.width / 2
			const originY = clientY - rect.top - rect.height / 2
			setScale(DOUBLE_TAP_SCALE)
			setPan(
				clampPan(
					{ x: -originX * (DOUBLE_TAP_SCALE - 1), y: -originY * (DOUBLE_TAP_SCALE - 1) },
					DOUBLE_TAP_SCALE
				)
			)
		},
		[scale, clampPan]
	)

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			;(e.target as Element).setPointerCapture?.(e.pointerId)
			pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
			const now = performance.now()

			// Starting a fresh gesture — any in-progress swipe is over.
			setIsSwiping(false)

			if (pointersRef.current.size === 1) {
				if (
					lastTapRef.current &&
					now - lastTapRef.current.time < 300 &&
					distanceBetween(lastTapRef.current, { x: e.clientX, y: e.clientY }) < 30
				) {
					handleDoubleTap(e.clientX, e.clientY)
					lastTapRef.current = null
				} else {
					lastTapRef.current = { time: now, x: e.clientX, y: e.clientY }
				}

				gestureRef.current = {
					...gestureRef.current,
					mode: scale > 1.01 ? 'pan' : 'idle',
					startX: e.clientX,
					startY: e.clientY,
					startTime: now,
					panStart: { ...pan },
					scaleStart: scale
				}
			} else if (pointersRef.current.size === 2) {
				const points = Array.from(pointersRef.current.values())
				gestureRef.current = {
					...gestureRef.current,
					mode: 'pinch',
					pinchStartDist: distanceBetween(points[0], points[1]),
					pinchStartMid: midpointOf(points[0], points[1]),
					scaleStart: scale,
					panStart: { ...pan }
				}
			}
		},
		[scale, pan, handleDoubleTap]
	)

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (!pointersRef.current.has(e.pointerId)) return
			pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
			const g = gestureRef.current

			if (g.mode === 'pinch' && pointersRef.current.size === 2) {
				const points = Array.from(pointersRef.current.values())
				const newDist = distanceBetween(points[0], points[1])
				const newMid = midpointOf(points[0], points[1])
				const ratio = g.pinchStartDist > 0 ? newDist / g.pinchStartDist : 1
				const newScale = clampScale(g.scaleStart * ratio)
				const midDelta = { x: newMid.x - g.pinchStartMid.x, y: newMid.y - g.pinchStartMid.y }
				setScale(newScale)
				setPan(clampPan({ x: g.panStart.x + midDelta.x, y: g.panStart.y + midDelta.y }, newScale))
				return
			}

			if (g.mode === 'pan') {
				const dx = e.clientX - g.startX
				const dy = e.clientY - g.startY
				setPan(clampPan({ x: g.panStart.x + dx, y: g.panStart.y + dy }, scale))
				return
			}

			if (g.mode === 'idle' && scale <= 1.01) {
				const dx = e.clientX - g.startX
				const dy = e.clientY - g.startY
				if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
					gestureRef.current.mode = 'swipe'
					setIsSwiping(true)
				}
			}

			if (gestureRef.current.mode === 'swipe') {
				setDragX(e.clientX - g.startX)
			}
		},
		[scale, clampPan]
	)

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			pointersRef.current.delete(e.pointerId)
			const g = gestureRef.current

			if (g.mode === 'swipe') {
				const dx = e.clientX - g.startX
				const dt = Math.max(1, performance.now() - g.startTime)
				const velocity = (dx / dt) * 1000
				const threshold = containerSize.width * SWIPE_THRESHOLD_RATIO

				if ((dx < -threshold || velocity < -SWIPE_VELOCITY_THRESHOLD) && index < images.length - 1) {
					onIndexChange(index + 1)
				} else if ((dx > threshold || velocity > SWIPE_VELOCITY_THRESHOLD) && index > 0) {
					onIndexChange(index - 1)
				}
				setDragX(0)
				setIsSwiping(false)
			}

			if (g.mode === 'pinch' && pointersRef.current.size < 2 && scale < 1.05) {
				setScale(1)
				setPan({ x: 0, y: 0 })
			}

			if (pointersRef.current.size === 0) {
				gestureRef.current.mode = 'idle'
			} else if (pointersRef.current.size === 1) {
				const [remaining] = Array.from(pointersRef.current.values())
				gestureRef.current = {
					...gestureRef.current,
					mode: scale > 1.01 ? 'pan' : 'idle',
					startX: remaining.x,
					startY: remaining.y,
					startTime: performance.now(),
					panStart: { ...pan },
					scaleStart: scale
				}
			}
		},
		[scale, pan, index, images.length, containerSize.width, onIndexChange]
	)

	// Wheel/trackpad zoom needs a native, non-passive listener so preventDefault sticks
	useEffect(() => {
		const el = containerRef.current
		if (!el) return

		const onWheelNative = (e: WheelEvent) => {
			e.preventDefault()
			const rect = el.getBoundingClientRect()
			const cursor = { x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 }

			setScale((prevScale) => {
				const newScale = clampScale(prevScale - e.deltaY * 0.012)
				setPan((prevPan) => {
					const ratio = newScale / prevScale
					const next = {
						x: cursor.x - (cursor.x - prevPan.x) * ratio,
						y: cursor.y - (cursor.y - prevPan.y) * ratio
					}
					return clampPan(next, newScale)
				})
				return newScale
			})
		}

		el.addEventListener('wheel', onWheelNative, { passive: false })
		return () => el.removeEventListener('wheel', onWheelNative)
	}, [clampPan])

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 overflow-hidden"
			style={{ touchAction: 'none' }}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
		>
			<motion.div
				className="flex h-full"
				style={{ width: `${images.length * 100}%` }}
				animate={{ x: -(index * containerSize.width) + (isSwiping ? dragX : 0) }}
				transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 42 }}
			>
				{images.map((src, i) => (
					<div
						key={`${src}-${i}`}
						className="h-full shrink-0 flex items-center justify-center"
						style={{ width: `${100 / images.length}%` }}
					>
						<motion.div
							className="relative w-full h-full"
							animate={i === index ? { scale, x: pan.x, y: pan.y } : { scale: 1, x: 0, y: 0 }}
							transition={
								reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 32 }
							}
							style={{ cursor: i === index && scale > 1.01 ? 'grab' : 'zoom-in' }}
						>
							<Image
								src={src}
								alt={getAlt ? getAlt(i) : `Изображение ${i + 1}`}
								fill
								sizes="100vw"
								draggable={false}
								priority={i === index}
								className="object-contain select-none"
								onLoad={(e) => {
									if (i !== index) return
									const img = e.currentTarget
									if (
										img.naturalWidth &&
										img.naturalHeight &&
										containerSize.width &&
										containerSize.height
									) {
										const fit = Math.min(
											containerSize.width / img.naturalWidth,
											containerSize.height / img.naturalHeight
										)
										setImageBox({ width: img.naturalWidth * fit, height: img.naturalHeight * fit })
									}
								}}
							/>
						</motion.div>
					</div>
				))}
			</motion.div>

			{scale > 1.01 && (
				<button
					type="button"
					onClick={() => {
						setScale(1)
						setPan({ x: 0, y: 0 })
					}}
					className={cn(
						'absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-medium hover:bg-white/20 active:scale-95 transition-all',
						images.length > 1 ? 'bottom-6 sm:bottom-28' : 'bottom-6'
					)}
					style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
				>
					Сбросить масштаб
				</button>
			)}
		</div>
	)
}
