import React, { forwardRef, useMemo } from 'react'
import { OmitEx, processColorsToNative } from 'react-native-yamap-plus/src/utils'
import CircleNativeComponent, { CircleNativeProps } from 'react-native-yamap-plus/src/spec/CircleNativeComponent'

export type CircleComponentInstanceRef = React.ComponentRef<typeof CircleNativeComponent>

type CircleProps = OmitEx<CircleNativeProps, 'fillColor' | 'strokeColor' | 'zI'> & {
	fillColor?: string
	strokeColor?: string
	zIndex?: number
}

/**
 * Улучшенная оболочка над CircleNativeComponent
 * - поддерживает forwardRef
 * - принимает JS цвета
 * - правильно пробрасывает zIndex → zI
 */
export const CircleCustom = forwardRef<CircleComponentInstanceRef, CircleProps>(({ zIndex, ...props }, ref) => {
	const nativeProps = useMemo(() => processColorsToNative(props, ['fillColor', 'strokeColor']), [props])

	return <CircleNativeComponent ref={ref} zI={zIndex} {...nativeProps} />
})

CircleCustom.displayName = 'CircleCustom'
