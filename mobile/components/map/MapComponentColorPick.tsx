import React from 'react'
import { Platform } from 'react-native'
import RNMapComponentColorPick, { IRNMapComponentColorPickProps } from '@/components/map/RNMapComponentColorPick'
import YaMapComponentColorPick, { IYaMapComponentColorPickProps } from '@/components/map/YaMapComponentColorPick'
import { PolylineProps } from '@/components/map/PolylineCustom'

type WorkoutMapProps = Omit<IRNMapComponentColorPickProps, 'appleLogoPosition' | 'appleLegalPosition'> &
	Omit<IYaMapComponentColorPickProps, 'logoPosition' | 'logoPadding'> & {
		animatedYaMapPolylineProps?: Partial<PolylineProps>
		animatedYaMapPausedPolylineProps?: Partial<PolylineProps>
	}

const MapComponentColorPick = (props: WorkoutMapProps) => {
	const isIOS = Platform.OS === 'ios'
	const { animatedYaMapPolylineProps, animatedYaMapPausedPolylineProps, ...restProps } = props

	if (isIOS) {
		return <RNMapComponentColorPick {...restProps} />
	}

	return (
		<YaMapComponentColorPick
			animatedYaMapPolylineProps={animatedYaMapPolylineProps}
			animatedYaMapPausedPolylineProps={animatedYaMapPausedPolylineProps}
			{...restProps}
		/>
	)
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
