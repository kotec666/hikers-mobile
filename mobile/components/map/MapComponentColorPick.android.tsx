import React from 'react'
import YaMapComponentColorPick from '@/components/map/YaMapComponentColorPick'
import type { MapComponentColorPickProps } from './MapComponentColorPick.types'

const MapComponentColorPick = (props: MapComponentColorPickProps) => {
	const { rnMapColorPickRef, rnMapUserLocationMarkerRef, ...restProps } = props

	return <YaMapComponentColorPick {...restProps} />
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
