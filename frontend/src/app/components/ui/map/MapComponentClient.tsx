'use client'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import React, { useMemo } from 'react'
import L from 'leaflet'
import { ITrainingPoint } from '@/api/workout'
import { FitMapToRoute } from './FitToMapRoute'
import {
	FinishMarkerFlagSvg,
	PauseMarkerSvg,
	ResumeMarkerSvg,
	StartMarkerSvg,
	SvgIconProps
} from '@/app/components/svg'
import { renderToStaticMarkup } from 'react-dom/server'
import 'leaflet/dist/leaflet.css'
import './map.css'
import { cn } from '@/helpers/cn'

const createIcon = (Svg: React.FC<SvgIconProps>) =>
	L.divIcon({
		html: renderToStaticMarkup(<Svg className="text-green-main" />),
		className: '',
		iconSize: [32, 32]
	})

const startIcon = createIcon(StartMarkerSvg)
const finishIcon = createIcon(FinishMarkerFlagSvg)
const pauseIcon = createIcon(PauseMarkerSvg)
const resumeIcon = createIcon(ResumeMarkerSvg)

interface Segment {
	points: [number, number][]
	isPaused: boolean
}

interface TransitionMarker {
	type: 'pause' | 'resume'
	position: [number, number]
}

export default function MapComponentClient({
	points,
	setMapInstance,
	className
}: {
	points: ITrainingPoint[]
	setMapInstance?: (map: L.Map | null) => void
	className?: string
}) {
	const { segments, transitions } = useMemo(() => {
		if (!points.length) return { segments: [], transitions: [] }

		const segments: Segment[] = []
		const transitions: TransitionMarker[] = []

		let currentGroup: ITrainingPoint[] = [points[0]]

		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1]
			const curr = points[i]

			const sameState = prev.paused === curr.paused

			if (sameState) {
				currentGroup.push(curr)
			} else {
				// закрываем сегмент
				currentGroup.push(curr)

				segments.push({
					isPaused: prev.paused,
					points: currentGroup.map((p) => [p.lat, p.lng])
				})

				transitions.push({
					type: prev.paused ? 'resume' : 'pause',
					position: [curr.lat, curr.lng]
				})

				currentGroup = [curr]
			}
		}

		// финальный сегмент
		if (currentGroup.length) {
			segments.push({
				isPaused: currentGroup[0].paused,
				points: currentGroup.map((p) => [p.lat, p.lng])
			})
		}

		return { segments, transitions }
	}, [points])

	const startPoint = points[0]
	const endPoint = points[points.length - 1]

	return (
		<MapContainer
			ref={(ref) => setMapInstance?.(ref)}
			center={[51.505, -0.09]}
			zoom={13}
			zoomDelta={0.1}
			zoomSnap={0.5}
			className={cn('h-full w-full', className)}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

			{points.length > 0 && (
				<>
					<FitMapToRoute points={points} />
					{segments.map((segment, i) => (
						<Polyline
							key={i}
							positions={segment.points}
							pathOptions={{
								color: segment.isPaused ? '#9ca3af' : '#22c55e',
								weight: 4
							}}
						/>
					))}
					{startPoint && <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />}
					{transitions.map((t, i) => (
						<Marker key={i} position={t.position} icon={t.type === 'pause' ? pauseIcon : resumeIcon} />
					))}
					{endPoint && <Marker position={[endPoint.lat, endPoint.lng]} icon={finishIcon} />}
				</>
			)}
		</MapContainer>
	)
}
