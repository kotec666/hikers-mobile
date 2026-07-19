import React, { forwardRef } from 'react'
import { OmitEx, processColorsToNative } from 'react-native-yamap-plus/src/utils'
import PolylineNativeComponent, { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'

export type PolylineComponentInstanceRef = React.ComponentRef<typeof PolylineNativeComponent>

export type PolylineProps = OmitEx<PolylineNativeProps, 'strokeColor' | 'outlineColor' | 'zI'> & {
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
	return (
		<PolylineNativeComponent
			ref={ref}
			zI={zIndex}
			{...processColorsToNative(props, ['strokeColor', 'outlineColor'])}
		/>
	)
})

PolylineCustom.displayName = 'PolylineCustom'
