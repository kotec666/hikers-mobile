import { Yamap } from 'react-native-yamap-plus-lite'
import UserLocationMarker from '@/components/ui/UserLocationMarker'
import React, { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

export interface ILatLng {
	lat: number
	lon: number
}

interface IProps {
	maxMapHeight?: number
	minMapHeight?: number
	rounded?: number
	accuracy?: number | null
	heading?: number
	markerPosition?: ILatLng | null
}

const MapComponent = (props: IProps) => {
	const isFirstRenderPosition = useRef(false)
	const oldMarkerPosition = useRef<ILatLng | null | undefined>(null)
	const oldHeading = useRef(props.heading)
	const [animatedMarkerPosition, setAnimatedMarkerPosition] = useState<ILatLng | undefined | null>(
		props.markerPosition
	)
	const [animatedHeading, setAnimatedHeading] = useState<number | undefined>(props.heading)
	const [isAnimating, setIsAnimating] = useState(false)
	const [isHeadingAnimating, setIsHeadingAnimating] = useState(false)

	const animateToPosition = (targetPosition: ILatLng, duration: number = 500) => {
		if (isAnimating) return
		if (!oldMarkerPosition.current) return

		setIsAnimating(true)
		const startPosition = oldMarkerPosition.current
		const startTime = Date.now()

		const animateFrame = () => {
			const currentTime = Date.now()
			const progress = Math.min((currentTime - startTime) / duration, 1)

			// Эффект easing для более плавной анимации
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)

			const newLat = startPosition.lat + (targetPosition.lat - startPosition.lat) * easeOutQuart
			const newLon = startPosition.lon + (targetPosition.lon - startPosition.lon) * easeOutQuart

			const newPosition = { lat: newLat, lon: newLon }

			// Обновляем обе позиции синхронно
			setAnimatedMarkerPosition?.(newPosition)
			oldMarkerPosition.current = newPosition

			if (progress < 1) {
				requestAnimationFrame(animateFrame)
			} else {
				setIsAnimating(false)
			}
		}

		requestAnimationFrame(animateFrame)
	}

	const animateHeading = (targetHeading: number, duration: number = 300) => {
		if (isHeadingAnimating) return
		if (typeof oldHeading.current !== 'number') return

		setIsHeadingAnimating(true)
		const startHeading = oldHeading.current
		const startTime = Date.now()

		// Нормализуем углы для корректного расчета кратчайшего пути
		const normalizedStart = ((startHeading % 360) + 360) % 360
		const normalizedTarget = ((targetHeading % 360) + 360) % 360

		// Вычисляем кратчайший путь поворота
		let diff = normalizedTarget - normalizedStart
		if (diff > 180) {
			diff -= 360
		} else if (diff < -180) {
			diff += 360
		}

		const animateFrame = () => {
			const currentTime = Date.now()
			const progress = Math.min((currentTime - startTime) / duration, 1)

			// Эффект easing для плавной анимации
			const easeOutQuart = 1 - Math.pow(1 - progress, 4)

			const newHeading = startHeading + diff * easeOutQuart

			setAnimatedHeading(newHeading)
			oldHeading.current = newHeading

			if (progress < 1) {
				requestAnimationFrame(animateFrame)
			} else {
				// Убеждаемся, что конечное значение точно равно целевому
				setAnimatedHeading(targetHeading)
				setIsHeadingAnimating(false)
			}
		}

		requestAnimationFrame(animateFrame)
	}

	useEffect(() => {
		if (typeof oldHeading.current === 'number' && typeof props.heading === 'number') {
			animateHeading(props.heading, 300)
		}
	}, [props.heading])

	useEffect(() => {
		if (props.markerPosition && !isFirstRenderPosition.current) {
			oldMarkerPosition.current = props.markerPosition
			isFirstRenderPosition.current = true
		}
	}, [props.markerPosition])

	useEffect(() => {
		if (props.markerPosition && oldMarkerPosition.current) {
			animateToPosition(props.markerPosition, 500)
		}
	}, [props.markerPosition])

	return (
		<View className="flex-1" style={{ overflow: 'hidden', borderRadius: props.rounded || 0 }}>
			<Yamap
				nightMode
				initialRegion={{ lat: 53.422506, lon: 49.4781051, zoom: 12 }}
				style={{ flex: 1, maxHeight: props.maxMapHeight, minHeight: props.minMapHeight }}
				logoPosition={{ horizontal: 'right', vertical: 'top' }}
				followUser
				showUserPosition={false}
				tiltGesturesEnabled={false}
			>
				<UserLocationMarker
					position={animatedMarkerPosition}
					accuracy={props.accuracy}
					heading={animatedHeading}
				/>

				{/*{foregroundLocations?.length && (*/}
				{/*	<Polyline*/}
				{/*		points={foregroundLocations.map((location) => ({*/}
				{/*			lat: location.coords.latitude,*/}
				{/*			lon: location.coords.longitude*/}
				{/*		}))}*/}
				{/*		strokeWidth={4}*/}
				{/*		strokeColor={Colors['green-main']}*/}
				{/*		outlineColor={Colors['green-main']}*/}
				{/*		outlineWidth={2}*/}
				{/*		handled={false}*/}
				{/*		gapLength={5}*/}
				{/*		dashLength={0}*/}
				{/*	/>*/}
				{/*)}*/}
			</Yamap>
		</View>
	)
}

export default MapComponent
