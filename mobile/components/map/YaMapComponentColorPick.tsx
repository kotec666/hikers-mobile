import React from 'react'
import { View } from 'react-native'
import { Yamap } from 'react-native-yamap-plus'
import YaMapPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/YaMapPauseLocationMarker'
import YaMapResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/YaMapResumeLocationMarker'
import YaMapStartLocationMarker from '@/components/map/markers/StartLocationMarker/YaMapStartLocationMarker'
import YaMapFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/YaMapFinishLocationMarker'
import YaMapUserLocationMarker from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { adjustRgbaOpacity } from '@/helpers/colors/adjustRgbaOpacity'
import { PolylineCustom } from '@/components/map/PolylineCustom'
import { mapCenter, firstPoint, secondPoint, thirdPoint, fourthPoint, fifthPoint, sixthPoint } from '@/constants/RNMap'

export interface IYaMapComponentColorPickProps {
	activeColor?: string
	interactiveDisabled?: boolean
	maxContainerHeight?: number
	rounded?: number
	logoPosition?: {
		horizontal?: 'left' | 'center' | 'right'
		vertical?: 'top' | 'bottom'
	}
	logoPadding?: {
		horizontal?: number
		vertical?: number
	}
}

const getSegmentColor = (isPaused: boolean, userColor: string) => {
	if (isPaused) {
		return adjustRgbaOpacity(userColor, (a) => a / 2)
	}
	return userColor
}

const YaMapComponentColorPick = (props: IYaMapComponentColorPickProps) => {
	const activeColor = props.activeColor ?? 'rgb(0, 200, 100, 1)'
	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className="flex-1 overflow-hidden border-[1px] border-white/20"
			style={{
				borderRadius: props.rounded || 0,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<Yamap
				nightMode
				initialRegion={{ ...mapCenter, zoom: 17 }}
				style={{ height: '100%', width: '100%' }}
				logoPosition={props.logoPosition || { horizontal: 'right', vertical: 'top' }}
				logoPadding={props.logoPadding}
				showUserPosition={false}
				interactiveDisabled={props.interactiveDisabled}
				tiltGesturesDisabled
				rotateGesturesDisabled
			>
				<YaMapUserLocationMarker
					key={`user-${activeColor}`}
					initialPosition={mapCenter}
					color={activeColor}
					debugAccuracyM={20}
				/>
				<YaMapStartLocationMarker key={`start-${activeColor}`} position={firstPoint} color={activeColor} />
				<PolylineCustom
					key={`poly-1-${activeColor}`}
					points={[firstPoint, secondPoint]}
					strokeColor={getSegmentColor(false, activeColor)}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-2-${activeColor}`}
					points={[secondPoint, thirdPoint]}
					strokeColor={getSegmentColor(true, activeColor)}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-3-${activeColor}`}
					points={[thirdPoint, fourthPoint]}
					strokeColor={getSegmentColor(true, activeColor)}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-4-${activeColor}`}
					points={[fifthPoint, sixthPoint]}
					strokeColor={getSegmentColor(false, activeColor)}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor="transparent"
				/>
				<YaMapPauseLocationMarker key={`pause-1-${activeColor}`} position={secondPoint} color={activeColor} />
				<YaMapResumeLocationMarker key={`resume-1-${activeColor}`} position={fourthPoint} color={activeColor} />
				<YaMapFinishLocationMarker key={`finish-${activeColor}`} position={sixthPoint} color={activeColor} />
			</Yamap>
		</View>
	)
}

export default React.memo(YaMapComponentColorPick, (prev, next) => {
	return (
		prev.rounded === next.rounded &&
		prev.activeColor === next.activeColor &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.interactiveDisabled === next.interactiveDisabled
	)
})
