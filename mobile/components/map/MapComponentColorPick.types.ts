import type React from 'react'
import type { IRNMapComponentColorPickProps, RNMapColorPickHandle } from '@/components/map/RNMapComponentColorPick'
import type { IYaMapComponentColorPickProps } from '@/components/map/YaMapComponentColorPick'
import type { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'

export type MapComponentColorPickProps = Omit<
	IRNMapComponentColorPickProps,
	'appleLogoPosition' | 'appleLegalPosition'
> &
	Omit<IYaMapComponentColorPickProps, 'logoPosition' | 'logoPadding'> & {
		rnMapColorPickRef: React.RefObject<RNMapColorPickHandle | null>
		rnMapUserLocationMarkerRef: React.RefObject<RNMapsUserLocationMarkerHandle | null>
		animatedStrokeColorProps?: Partial<{ strokeColor: string }>
		animatedStrokeColorWithOpacityProps?: Partial<{ strokeColor: string }>
		animatedStrokeProps?: Partial<{ stroke: string }>
		animatedFillProps?: Partial<{ fill: string }>
		animatedFillColorProps?: Partial<{ fillColor: string }>
	}
