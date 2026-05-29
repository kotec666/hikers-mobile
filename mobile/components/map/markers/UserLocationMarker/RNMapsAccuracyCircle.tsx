import React, { forwardRef, useImperativeHandle, useCallback, useRef } from 'react'
import { setRgbaOpacity } from '@/helpers/colors/setRgbaOpacity'
import { Circle } from 'react-native-maps'
import { IPoint } from '@/types/interfaces'

interface IProps {
	initialPosition: IPoint
	color?: string
	debugAccuracyM?: number
}

export interface AccuracyCircleHandle {
	setCircleCenter: (center: IPoint | null) => void
	hideCircle: (hidden: boolean) => void
	setAccuracy: (accuracy: number | null) => void
}

type CircleRef = React.ComponentRef<typeof Circle>
const AccuracyCircle = forwardRef<AccuracyCircleHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const circleRef = useRef<CircleRef | null>(null)
	const radiusRef = useRef(0)
	const opacityRef = useRef(0.2)

	const setHiddenCircle = useCallback(
		(hidden: boolean) => {
			opacityRef.current = hidden ? 0 : 0.2

			const baseColor = props.color ?? 'rgb(0, 200, 100)'
			const fillColor = setRgbaOpacity(baseColor, opacityRef.current)

			circleRef.current?.setNativeProps({ fillColor })
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
				center: {
					latitude: center.lat,
					longitude: center.lon
				}
			})
		},

		setAccuracy: (accuracy) => {
			const r = accuracy ?? 0
			radiusRef.current = r
			circleRef.current?.setNativeProps({
				radius: r
			})
		},

		hideCircle: (hidden) => setHiddenCircle(hidden)
	}))

	if (!initialPoint?.lat || !initialPoint?.lon) return null
	return (
		<Circle
			ref={circleRef}
			center={{
				latitude: initialPoint.lat,
				longitude: initialPoint.lon
			}}
			radius={props.debugAccuracyM ?? radiusRef.current}
			fillColor={setRgbaOpacity(props.color ?? 'rgb(0, 200, 100)', opacityRef.current)}
			strokeColor="transparent"
			strokeWidth={0}
			style={{
				zIndex: 5
			}}
		/>
	)
})

AccuracyCircle.displayName = 'AccuracyCircle'

export default React.memo(AccuracyCircle)
