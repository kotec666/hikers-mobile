import { Canvas, Group, Circle, Path, Skia } from '@shopify/react-native-skia'
import React, { memo, useMemo } from 'react'

interface RingDef {
	value: number // 0..1
	color: string
	background: string
}

interface Props {
	size: number
	rings?: RingDef[] // порядок: снаружи внутрь
}

const DEFAULT_RINGS: RingDef[] = [
	{ value: 1.3 % 1 || 1, color: 'rgb(250,17,133)', background: 'rgb(50,3,16)' },
	{ value: 0.4, color: 'rgb(216,255,1)', background: 'rgb(34,51,0)' },
	{ value: 1.6 % 1 || 1, color: 'rgb(2,255,168)', background: 'rgb(4,58,54)' }
]

const STROKE_RATIO = 0.1
const RING_GAP = 2

export const MiniRing = memo(({ size, rings = DEFAULT_RINGS }: Props) => {
	const strokeWidth = size * STROKE_RATIO
	const center = size / 2

	const layout = useMemo(() => {
		return rings.map((ring, i) => {
			const r = center - strokeWidth / 2 - i * (strokeWidth + RING_GAP)
			const rect = Skia.XYWHRect(center - r, center - r, r * 2, r * 2)
			const arc = Skia.PathBuilder.Make()
				.addArc(rect, -90, 360 * Math.min(ring.value, 1))
				.detach()
			return { ...ring, r, arc, key: `ring-${i}` }
		})
	}, [rings, center, strokeWidth])

	return (
		<Canvas style={{ width: size, height: size }}>
			<Group>
				{layout.map(({ key, r, arc, color, background }) => (
					<Group key={key}>
						<Circle
							cx={center}
							cy={center}
							r={r}
							style="stroke"
							strokeWidth={strokeWidth}
							color={background}
						/>
						<Path path={arc} style="stroke" strokeWidth={strokeWidth} strokeCap="round" color={color} />
					</Group>
				))}
			</Group>
		</Canvas>
	)
})

MiniRing.displayName = 'MiniRing'
