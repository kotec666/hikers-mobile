'use client'
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, memo, useCallback } from 'react'
import { ITrainingPoint } from '@/api/workout'
import { StartMarkerSvg, FinishMarkerFlagSvg, PauseMarkerSvg, ResumeMarkerSvg, SvgIconProps } from '@/components/svg'
import { renderToStaticMarkup } from 'react-dom/server'
import YMapLoader from '@/components/ui/map/ymap-loader'
import { YMap as YMapType, YMapFeature as YMapFeatureType, YMapMarker as YMapMarkerType } from '@yandex/ymaps3-types'
import { useMap } from '@/components/providers/map-provider'
import { cn } from '@/lib/utils'

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

const YandexMapInner = forwardRef<YandexMapRef, IYandexMapProps>(({ points: propPoints, className }, ref) => {
	const { reactifyApi } = useMap()
	const [mapRef, setMapRef] = useState<YMapType | null>(null)
	const objectsRef = useRef<(YMapFeatureType | YMapMarkerType)[]>([])

	const buildRouteOnMap = useCallback(
		(points: ITrainingPoint[]) => {
			if (!mapRef || !points.length) return
			const { YMapFeature, YMapMarker } = ymaps3

			objectsRef.current.forEach((obj) => mapRef.removeChild(obj))
			objectsRef.current = []

			const segments: Segment[] = []
			const transitions: TransitionMarker[] = []

			let currentGroup: ITrainingPoint[] = [points[0]]
			let minLng = points[0].lng,
				maxLng = points[0].lng
			let minLat = points[0].lat,
				maxLat = points[0].lat

			for (let i = 1; i < points.length; i++) {
				const prev = points[i - 1],
					curr = points[i]
				minLng = Math.min(minLng, curr.lng)
				maxLng = Math.max(maxLng, curr.lng)
				minLat = Math.min(minLat, curr.lat)
				maxLat = Math.max(maxLat, curr.lat)

				if (prev.paused === curr.paused) {
					currentGroup.push(curr)
				} else {
					currentGroup.push(curr)
					segments.push({ isPaused: prev.paused, points: currentGroup.map((p) => [p.lng, p.lat]) })
					transitions.push({ type: prev.paused ? 'resume' : 'pause', position: [curr.lng, curr.lat] })
					currentGroup = [curr]
				}
			}

			if (currentGroup.length) {
				segments.push({ isPaused: currentGroup[0].paused, points: currentGroup.map((p) => [p.lng, p.lat]) })
			}

			segments.forEach((seg) => {
				const line = new YMapFeature({
					geometry: { type: 'LineString', coordinates: seg.points },
					style: { stroke: [{ width: 4, color: seg.isPaused ? pausedLineColor : activeLineColor }] }
				})
				mapRef.addChild(line)
				objectsRef.current.push(line)
			})

			const start = points[0],
				end = points[points.length - 1]
			if (start) {
				const marker = new YMapMarker(
					{ coordinates: [start.lng, start.lat] },
					createMarkerElement(StartMarkerSvg, activeLineColor)
				)
				mapRef.addChild(marker)
				objectsRef.current.push(marker)
			}
			transitions.forEach((t) => {
				const Svg = t.type === 'pause' ? PauseMarkerSvg : ResumeMarkerSvg
				const marker = new YMapMarker({ coordinates: t.position }, createMarkerElement(Svg, activeLineColor))
				mapRef.addChild(marker)
				objectsRef.current.push(marker)
			})
			if (end) {
				const marker = new YMapMarker(
					{ coordinates: [end.lng, end.lat] },
					createMarkerElement(FinishMarkerFlagSvg, activeLineColor)
				)
				mapRef.addChild(marker)
				objectsRef.current.push(marker)
			}

			mapRef.update({
				location: {
					bounds: [
						[minLng, minLat],
						[maxLng, maxLat]
					]
				},
				margin: [60, 60, 60, 60]
			})
		},
		[mapRef]
	)

	useEffect(() => {
		if (Array.isArray(propPoints) && propPoints.length) {
			buildRouteOnMap(propPoints)
		}
	}, [propPoints, mapRef, buildRouteOnMap])

	useImperativeHandle(ref, () => ({
		setPath: (newPoints: ITrainingPoint[]) => {
			buildRouteOnMap(newPoints)
		}
	}))

	if (!reactifyApi)
		return (
			<div className={cn('overflow-hidden', className)} style={{ width: '100%', height: '100%' }}>
				<YMapLoader />
			</div>
		)

	const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = reactifyApi

	return (
		<div className={cn('overflow-hidden', className)} style={{ width: '100%', height: '100%' }}>
			<YMap ref={(ref) => setMapRef(ref)} location={{ center: [37.57, 55.75], zoom: 13 }} theme="dark">
				<YMapDefaultSchemeLayer />
				<YMapDefaultFeaturesLayer />
			</YMap>
		</div>
	)
})

const arePointsEqual = (a?: ITrainingPoint[], b?: ITrainingPoint[]) => {
	if (!a && !b) return true
	if (!a || !b) return false
	if (a.length !== b.length) return false

	for (let i = 0; i < a.length; i++) {
		const p1 = a[i]
		const p2 = b[i]
		if (
			p1.lat !== p2.lat ||
			p1.lng !== p2.lng ||
			p1.paused !== p2.paused ||
			p1.alt !== p2.alt ||
			p1.rel_ts !== p2.rel_ts ||
			p1.distance !== p2.distance ||
			p1.speed_kmh !== p2.speed_kmh
		) {
			return false
		}
	}
	return true
}

const YandexMap = memo(
	YandexMapInner,
	(prev, next) => arePointsEqual(prev.points, next.points) && prev.className === next.className
)

YandexMapInner.displayName = 'YandexMapInner'
export default YandexMap
