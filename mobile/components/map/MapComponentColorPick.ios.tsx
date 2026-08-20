import React from 'react'
import RNMapComponentColorPick from '@/components/map/RNMapComponentColorPick'
import type { MapComponentColorPickProps } from './MapComponentColorPick.types'

const MapComponentColorPick = (props: MapComponentColorPickProps) => {
	const { rnMapColorPickRef, rnMapUserLocationMarkerRef, ...restProps } = props

	return (
		<RNMapComponentColorPick
			{...restProps}
			ref={rnMapColorPickRef}
			rnMapUserLocationMarkerRef={rnMapUserLocationMarkerRef}
		/>
	)
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
