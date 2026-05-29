import React, { forwardRef, useImperativeHandle, useCallback, useRef } from 'react'
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

export interface AccuracyCircleHandle {
	setCircleCenter: (center: Point | null) => void
	hideCircle: (hidden: boolean) => void
	setAccuracy: (accuracy: number | null) => void
}

const AccuracyCircle = forwardRef<AccuracyCircleHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const circleRef = useRef<CircleComponentInstanceRef | null>(null)
	const radiusRef = useRef(0)
	const opacityRef = useRef(0.2)

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
		setCircleCenter: (center) => {
			if (center === null) {
				setHiddenCircle(true)
				return
			}

			circleRef.current?.setNativeProps({
				center
			} as Partial<CircleNativeProps>)
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

AccuracyCircle.displayName = 'AccuracyCircle'

export default React.memo(AccuracyCircle)
