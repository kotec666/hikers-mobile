import React, { forwardRef, useMemo } from 'react'
import { OmitEx, processColorsToNative } from 'react-native-yamap-plus/src/utils'
import PolylineNativeComponent, { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'

export type PolylineComponentInstanceRef = React.ComponentRef<typeof PolylineNativeComponent>

type PolylineProps = OmitEx<PolylineNativeProps, 'strokeColor' | 'outlineColor' | 'zI'> & {
	strokeColor?: string
	outlineColor?: string
	zIndex?: number
}

/**
 * Улучшенная оболочка над PolylineNativeComponent
 * - поддерживает forwardRef
 * - принимает JS цвета
 * - правильно пробрасывает zIndex → zI
 */
export const PolylineCustom = forwardRef<PolylineComponentInstanceRef, PolylineProps>(({ zIndex, ...props }, ref) => {
	const nativeProps = useMemo(() => processColorsToNative(props, ['strokeColor', 'outlineColor']), [props])

	return <PolylineNativeComponent ref={ref} zI={zIndex} {...nativeProps} />
})

PolylineCustom.displayName = 'PolylineCustom'
