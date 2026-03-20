'use client'
import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { ITrainingPoint } from '@/api/workout'
import { cn } from '@/helpers/cn'
import {
	StartMarkerSvg,
	FinishMarkerFlagSvg,
	PauseMarkerSvg,
	ResumeMarkerSvg,
	SvgIconProps
} from '@/app/components/svg'
import { renderToStaticMarkup } from 'react-dom/server'
import { YMap as YMapType, YMapFeature as YMapFeatureType, YMapMarker as YMapMarkerType } from '@yandex/ymaps3-types'
import { useMap } from '@/app/components/providers/MapProvider'
import YMapLoader from '@/app/components/ui/map/YMapLoader'

function createMarkerElement(Svg: React.FC<SvgIconProps>, color = '#22c55e', size = 32) {
	const el = document.createElement('div')
	el.style.width = `${size}px`
	el.style.height = `${size}px`
	el.style.transform = 'translate(-50%, -50%)'
	el.innerHTML = renderToStaticMarkup(<Svg color={color} />)
	return el
}

interface Segment {
	points: [number, number][]
	isPaused: boolean
}

interface TransitionMarker {
	type: 'pause' | 'resume'
	position: [number, number]
}

const pausedLineColor = '#9ca3af'
const activeLineColor = '#20DC52'

export interface YandexMapRef {
	setPath: (points: ITrainingPoint[]) => void
}

interface IYandexMapProps {
	points?: ITrainingPoint[]
	className?: string
}

const YandexMap = forwardRef<YandexMapRef, IYandexMapProps>(({ points: propPoints, className }, ref) => {
	const { reactifyApi } = useMap()
	const [mapRef, setMapRef] = useState<YMapType | null>(null)
	const objectsRef = useRef<(YMapFeatureType | YMapMarkerType)[]>([])

	const [internalPoints, setInternalPoints] = useState<ITrainingPoint[]>(propPoints || [])

	useEffect(() => {
		if (Array.isArray(propPoints) && Boolean(propPoints.length)) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setInternalPoints(propPoints)
		}
	}, [propPoints])

	useImperativeHandle(ref, () => ({
		setPath: (newPoints: ITrainingPoint[]) => {
			setInternalPoints(newPoints)
		}
	}))

	const { segments, transitions, bounds } = useMemo(() => {
		if (!internalPoints.length) return { segments: [], transitions: [], bounds: null }

		const segments: Segment[] = []
		const transitions: TransitionMarker[] = []

		let currentGroup: ITrainingPoint[] = [internalPoints[0]]

		let minLng = internalPoints[0].lng
		let maxLng = internalPoints[0].lng
		let minLat = internalPoints[0].lat
		let maxLat = internalPoints[0].lat

		for (let i = 1; i < internalPoints.length; i++) {
			const prev = internalPoints[i - 1]
			const curr = internalPoints[i]

			minLng = Math.min(minLng, curr.lng)
			maxLng = Math.max(maxLng, curr.lng)
			minLat = Math.min(minLat, curr.lat)
			maxLat = Math.max(maxLat, curr.lat)

			if (prev.paused === curr.paused) {
				currentGroup.push(curr)
			} else {
				currentGroup.push(curr)

				segments.push({
					isPaused: prev.paused,
					points: currentGroup.map((p) => [p.lng, p.lat])
				})

				transitions.push({
					type: prev.paused ? 'resume' : 'pause',
					position: [curr.lng, curr.lat]
				})

				currentGroup = [curr]
			}
		}

		if (currentGroup.length) {
			segments.push({
				isPaused: currentGroup[0].paused,
				points: currentGroup.map((p) => [p.lng, p.lat])
			})
		}

		return {
			segments,
			transitions,
			bounds: [
				[minLng, minLat],
				[maxLng, maxLat]
			] as [[number, number], [number, number]]
		}
	}, [internalPoints])

	useEffect(() => {
		if (!mapRef) return
		const map = mapRef
		const { YMapFeature, YMapMarker } = ymaps3

		objectsRef.current.forEach((obj) => map.removeChild(obj))
		objectsRef.current = []

		segments.forEach((segment) => {
			const line = new YMapFeature({
				geometry: { type: 'LineString', coordinates: segment.points },
				style: { stroke: [{ width: 4, color: segment.isPaused ? pausedLineColor : activeLineColor }] }
			})
			map.addChild(line)
			objectsRef.current.push(line)
		})

		const start = internalPoints[0]
		const end = internalPoints[internalPoints.length - 1]

		if (start) {
			const marker = new YMapMarker(
				{ coordinates: [start.lng, start.lat] },
				createMarkerElement(StartMarkerSvg, activeLineColor)
			)
			map.addChild(marker)
			objectsRef.current.push(marker)
		}

		transitions.forEach((t) => {
			const Svg = t.type === 'pause' ? PauseMarkerSvg : ResumeMarkerSvg
			const marker = new YMapMarker({ coordinates: t.position }, createMarkerElement(Svg, activeLineColor))
			map.addChild(marker)
			objectsRef.current.push(marker)
		})

		if (end) {
			const marker = new YMapMarker(
				{ coordinates: [end.lng, end.lat] },
				createMarkerElement(FinishMarkerFlagSvg, activeLineColor)
			)
			map.addChild(marker)
			objectsRef.current.push(marker)
		}

		if (bounds) {
			map.update({ location: { bounds }, margin: [60, 60, 60, 60] })
		}
	}, [segments, transitions, bounds, internalPoints, mapRef])

	if (!reactifyApi)
		return (
			<div className={cn('overflow-hidden', className)} style={{ width: '100%', height: '100%' }}>
				<YMapLoader />
			</div>
		)

	const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = reactifyApi

	return (
		<div className={cn('overflow-hidden', className)} style={{ width: '100%', height: '100%' }}>
			<YMap
				ref={(YMapRefComponent) => setMapRef(YMapRefComponent)}
				location={{ center: [37.57, 55.75], zoom: 13 }}
				theme="dark"
			>
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />
			</YMap>
		</div>
	)
})

YandexMap.displayName = 'YandexMap'
export default YandexMap
