import React, { forwardRef, useImperativeHandle, useCallback, useRef } from 'react'
import { Point } from 'react-native-yamap-plus'
import { CircleComponentInstanceRef, CircleCustom } from '@/components/map/CircleCustom'
import { CircleNativeProps } from 'react-native-yamap-plus/src/spec/CircleNativeComponent'
import { processColorsToNative } from 'react-native-yamap-plus/src/utils'

interface IProps {
	initialPosition: Point
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

	const setHiddenCircle = useCallback((hidden: boolean) => {
		opacityRef.current = hidden ? 0 : 0.2

		const nativeProps = processColorsToNative({ fillColor: `rgba(0,200,100,${opacityRef.current})` }, [
			'fillColor'
		]) as Partial<CircleNativeProps>

		circleRef.current?.setNativeProps(nativeProps)
	}, [])

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

	console.log(`render AccuracyCircle: 1`)

	if (!initialPoint?.lat || !initialPoint?.lon) return null
	console.log(`render AccuracyCircle: 2`)
	return (
		<CircleCustom
			ref={circleRef}
			center={initialPoint}
			radius={radiusRef.current}
			fillColor="rgba(0,200,100,0.2)"
			strokeColor="transparent"
			strokeWidth={0}
			zIndex={5}
		/>
	)
})

AccuracyCircle.displayName = 'AccuracyCircle'

export default React.memo(AccuracyCircle)
