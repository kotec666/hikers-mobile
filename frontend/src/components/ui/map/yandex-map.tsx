'use client'
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, memo, useCallback } from 'react'
import { ITrainingPoint } from '@/api/workout'
import { StartMarkerSvg, FinishMarkerFlagSvg, PauseMarkerSvg, ResumeMarkerSvg, SvgIconProps } from '@/components/svg'
import { renderToStaticMarkup } from 'react-dom/server'
import YMapLoader from '@/components/ui/map/ymap-loader'
import { YMap as YMapType, YMapFeature as YMapFeatureType, YMapMarker as YMapMarkerType } from '@yandex/ymaps3-types'
import { useMap } from '@/components/providers/map-provider'
import { cn } from '@/lib/utils'
import { withOpacity } from '@/helpers/withOpacity'

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

// const pausedLineColor = '#9ca3af'
const defaultActiveLineColor = '#20DC52'

export interface YandexMapHandle {
	setPath: (points: ITrainingPoint[]) => void
}

interface IYandexMapProps {
	points?: ITrainingPoint[]
	className?: string
	routeColor?: string
}

const YandexMapInner = forwardRef<YandexMapHandle, IYandexMapProps>(
	({ points: propPoints, routeColor, className }, ref) => {
		const { reactifyApi } = useMap()
		const [mapRef, setMapRef] = useState<YMapType | null>(null)
		const objectsRef = useRef<(YMapFeatureType | YMapMarkerType)[]>([])

		const activeLineColor = routeColor || defaultActiveLineColor
		const pausedLineColor = routeColor ? withOpacity(routeColor, 0.5) : withOpacity(defaultActiveLineColor, 0.5)

		const buildRouteOnMap = useCallback(
			(points: ITrainingPoint[]) => {
				if (!mapRef || !points.length) return
				const { YMapFeature, YMapMarker } = ymaps3

				objectsRef.current.forEach((obj) => mapRef.removeChild(obj))
				objectsRef.current = []

				const segments: Segment[] = []
				const transitions: TransitionMarker[] = []

				let currentPaused = points[0].paused
				let currentPoints: [number, number][] = [[points[0].lng, points[0].lat]]
				let minLng = points[0].lng,
					maxLng = points[0].lng
				let minLat = points[0].lat,
					maxLat = points[0].lat

				// Сегментация как на мобилке (useWorkoutPath): сегмент — непрерывный участок одного
				// состояния, граничная точка дублируется в конце предыдущего и начале следующего.
				// Так у каждого сегмента >= 2 точек (Yandex не рисует LineString из одной точки).
				for (let i = 1; i < points.length; i++) {
					const curr = points[i]
					minLng = Math.min(minLng, curr.lng)
					maxLng = Math.max(maxLng, curr.lng)
					minLat = Math.min(minLat, curr.lat)
					maxLat = Math.max(maxLat, curr.lat)

					const coord: [number, number] = [curr.lng, curr.lat]

					if (curr.paused === currentPaused) {
						currentPoints.push(coord)
					} else {
						const boundary = currentPoints[currentPoints.length - 1]

						if (currentPoints.length >= 2) {
							segments.push({ isPaused: currentPaused, points: currentPoints })
						}

						transitions.push({ type: currentPaused ? 'resume' : 'pause', position: boundary })

						currentPaused = curr.paused
						currentPoints = [boundary, coord]
					}
				}

				if (currentPoints.length >= 2) {
					segments.push({ isPaused: currentPaused, points: currentPoints })
				}

				segments.forEach((seg) => {
					try {
						const line = new YMapFeature({
							geometry: { type: 'LineString', coordinates: seg.points },
							style: { stroke: [{ width: 4, color: seg.isPaused ? pausedLineColor : activeLineColor }] }
						})
						mapRef.addChild(line)
						objectsRef.current.push(line)
					} catch (e) {
						console.error('[yandex-map] failed to add line segment:', e)
					}
				})

				const start = points[0],
					end = points[points.length - 1]
				try {
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
						const marker = new YMapMarker(
							{ coordinates: t.position },
							createMarkerElement(Svg, activeLineColor)
						)
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
				} catch (e) {
					console.error('[yandex-map] failed to add markers:', e)
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
			[mapRef, activeLineColor, pausedLineColor]
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
				<YMap ref={setMapRef} location={{ center: [37.57, 55.75], zoom: 13 }} theme="dark">
					<YMapDefaultSchemeLayer />
					<YMapDefaultFeaturesLayer />
				</YMap>
			</div>
		)
	}
)

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
