import React from 'react'
import { Platform } from 'react-native'
import RNMapComponentColorPick, {
	IRNMapComponentColorPickProps,
	RNMapColorPickHandle
} from '@/components/map/RNMapComponentColorPick'
import YaMapComponentColorPick, { IYaMapComponentColorPickProps } from '@/components/map/YaMapComponentColorPick'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'

type WorkoutMapProps = Omit<IRNMapComponentColorPickProps, 'appleLogoPosition' | 'appleLegalPosition'> &
	Omit<IYaMapComponentColorPickProps, 'logoPosition' | 'logoPadding'> & {
		rnMapColorPickRef: React.RefObject<RNMapColorPickHandle | null>
		rnMapUserLocationMarkerRef: React.RefObject<RNMapsUserLocationMarkerHandle | null>
		animatedStrokeColorProps?: Partial<{ strokeColor: string }>
		animatedStrokeColorWithOpacityProps?: Partial<{ strokeColor: string }>
		animatedStrokeProps?: Partial<{ stroke: string }>
		animatedFillProps?: Partial<{ fill: string }>
		animatedFillColorProps?: Partial<{ fillColor: string }>
		animatedFillColorWithOpacityProps?: Partial<{ fillColor: string }>
	}

const MapComponentColorPick = (props: WorkoutMapProps) => {
	const isIOS = Platform.OS === 'ios'
	const { rnMapColorPickRef, rnMapUserLocationMarkerRef, ...restProps } = props

	if (isIOS) {
		return (
			<RNMapComponentColorPick
				{...restProps}
				ref={rnMapColorPickRef}
				rnMapUserLocationMarkerRef={rnMapUserLocationMarkerRef}
			/>
		)
	}

	return <YaMapComponentColorPick {...restProps} />
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
