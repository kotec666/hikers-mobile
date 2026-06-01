import React from 'react'
import { Platform } from 'react-native'
import RNMapComponentColorPick, { IRNMapComponentColorPickProps } from '@/components/map/RNMapComponentColorPick'
import YaMapComponentColorPick, { IYaMapComponentColorPickProps } from '@/components/map/YaMapComponentColorPick'

type WorkoutMapProps = Omit<IRNMapComponentColorPickProps, 'appleLogoPosition' | 'appleLegalPosition'> &
	Omit<IYaMapComponentColorPickProps, 'logoPosition' | 'logoPadding'> & {
		animatedStrokeColorProps?: Partial<{ strokeColor: string }>
		animatedStrokeColorWithOpacityProps?: Partial<{ strokeColor: string }>
		animatedStrokeProps?: Partial<{ stroke: string }>
		animatedFillProps?: Partial<{ fill: string }>
		animatedFillColorProps?: Partial<{ fillColor: string }>
		animatedFillColorWithOpacityProps?: Partial<{ fillColor: string }>
	}

const MapComponentColorPick = (props: WorkoutMapProps) => {
	const isIOS = Platform.OS === 'ios'
	const { ...restProps } = props

	if (isIOS) {
		return <RNMapComponentColorPick {...restProps} />
	}

	return <YaMapComponentColorPick {...restProps} />
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
