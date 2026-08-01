import React, { forwardRef, useImperativeHandle, useCallback, useRef, useEffect } from 'react'
import { Point } from 'react-native-yamap-plus'
import { CircleComponentInstanceRef, CircleCustom } from '@/components/map/CircleCustom'
import { CircleNativeProps } from 'react-native-yamap-plus/src/spec/CircleNativeComponent'
import { processColorsToNative } from 'react-native-yamap-plus/src/utils'
import { setRgbaOpacity } from '@/helpers/colors/setRgbaOpacity'

interface IProps {
	initialPosition: Point
	color?: string
	debugAccuracyM?: number
}

export interface YaMapAccuracyCircleHandle {
	setCircleCenter: (center: Point | null, durationMs?: number) => void
	hideCircle: (hidden: boolean) => void
	setAccuracy: (accuracy: number | null) => void
}

const YaMapAccuracyCircle = forwardRef<YaMapAccuracyCircleHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const circleRef = useRef<CircleComponentInstanceRef | null>(null)
	const radiusRef = useRef(0)
	const opacityRef = useRef(0.2)
	const centerRef = useRef<Point>(initialPoint)
	const animationFrameRef = useRef<number | null>(null)

	const setNativeCenter = useCallback((center: Point) => {
		centerRef.current = center
		circleRef.current?.setNativeProps({
			center
		} as Partial<CircleNativeProps>)
	}, [])

	const animateCenter = useCallback(
		(center: Point, durationMs = 0) => {
			if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)

			if (durationMs <= 0) {
				setNativeCenter(center)
				return
			}

			const startedAt = Date.now()
			const from = centerRef.current

			const animate = () => {
				const progress = Math.min((Date.now() - startedAt) / durationMs, 1)
				const nextCenter = {
					lat: from.lat + (center.lat - from.lat) * progress,
					lon: from.lon + (center.lon - from.lon) * progress
				}

				setNativeCenter(nextCenter)

				if (progress < 1) {
					animationFrameRef.current = requestAnimationFrame(animate)
				}
			}

			animationFrameRef.current = requestAnimationFrame(animate)
		},
		[setNativeCenter]
	)

	const setHiddenCircle = useCallback(
		(hidden: boolean) => {
			opacityRef.current = hidden ? 0 : 0.2

			const baseColor = props.color ?? 'rgb(0, 200, 100)'
			const fillColor = setRgbaOpacity(baseColor, opacityRef.current)

			const nativeProps = processColorsToNative({ fillColor }, ['fillColor']) as Partial<CircleNativeProps>

			circleRef.current?.setNativeProps(nativeProps)
		},
		[props.color]
	)

	useImperativeHandle(ref, () => ({
		setCircleCenter: (center, durationMs) => {
			if (center === null) {
				setHiddenCircle(true)
				return
			}

			animateCenter(center, durationMs)
		},

		setAccuracy: (accuracy) => {
			const r = accuracy ?? 0
			radiusRef.current = r
			circleRef.current?.setNativeProps({
				radius: r
			} as Partial<CircleNativeProps>)
		},

		hideCircle: (hidden) => setHiddenCircle(hidden)
	}))

	useEffect(() => {
		return () => {
			if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)
		}
	}, [])

	if (!initialPoint?.lat || !initialPoint?.lon) return null
	return (
		<CircleCustom
			ref={circleRef}
			center={initialPoint}
			radius={props.debugAccuracyM ?? radiusRef.current}
			fillColor={setRgbaOpacity(props.color ?? 'rgb(0, 200, 100)', opacityRef.current)}
			strokeColor="transparent"
			strokeWidth={0}
			zIndex={5}
		/>
	)
})

YaMapAccuracyCircle.displayName = 'YaMapAccuracyCircle'
export default React.memo(YaMapAccuracyCircle)
