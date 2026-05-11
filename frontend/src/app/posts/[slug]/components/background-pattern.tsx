'use client'
import {
	AlarmClockSvg,
	BicyclePersonSvg,
	DumbbellSvg,
	HeartRateSvg,
	MountainSvg,
	RunningPersonSvg,
	TrophySvg,
	WalkingPersonSvg
} from '@/components/svg'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function BackgroundPattern() {
	const [seed, setSeed] = useState<number>(0)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true)
		setSeed(Date.now())
	}, [])

	const pseudoRandom = useCallback(
		(i: number) => {
			const x = Math.sin((i + seed) * 999) * 10000
			return x - Math.floor(x)
		},
		[seed]
	)

	const icons = [
		BicyclePersonSvg,
		MountainSvg,
		WalkingPersonSvg,
		DumbbellSvg,
		TrophySvg,
		RunningPersonSvg,
		HeartRateSvg,
		AlarmClockSvg
	]

	const items = useMemo(() => {
		return Array.from({ length: 48 }).map((_, i) => ({
			index: i,
			rotation: pseudoRandom(i) * 360,
			scale: 0.8 + pseudoRandom(i + 1) * 0.4
		}))
	}, [pseudoRandom])

	if (!mounted) return null
	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
			<div className="absolute inset-0 grid grid-cols-12 gap-8 p-8">
				{items.map(({ rotation, scale, index }) => {
					const Icon = icons[index % icons.length]

					return (
						<div
							key={index}
							className="flex items-center justify-center"
							style={{
								transform: `rotate(${rotation}deg) scale(${scale})`
							}}
						>
							<Icon size={60} className="text-white" />
						</div>
					)
				})}
			</div>
		</div>
	)
}
