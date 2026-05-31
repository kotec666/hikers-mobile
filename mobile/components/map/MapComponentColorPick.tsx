import React from 'react'
import { Platform } from 'react-native'
import RNMapComponentColorPick, { IRNMapComponentColorPickProps } from '@/components/map/RNMapComponentColorPick'
import YaMapComponentColorPick, { IYaMapComponentColorPickProps } from '@/components/map/YaMapComponentColorPick'

type WorkoutMapProps = Omit<IRNMapComponentColorPickProps, 'appleLogoPosition' | 'appleLegalPosition'> &
	Omit<IYaMapComponentColorPickProps, 'logoPosition' | 'logoPadding'>

const MapComponentColorPick = (props: WorkoutMapProps) => {
	const isIOS = Platform.OS === 'ios'

	if (isIOS) {
		return <RNMapComponentColorPick {...props} />
	}

	return <YaMapComponentColorPick {...props} />
}

MapComponentColorPick.displayName = 'MapComponentColorPick'

export default React.memo(MapComponentColorPick)
