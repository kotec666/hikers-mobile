import React from 'react'
import { View } from 'react-native'
import { Yamap } from 'react-native-yamap-plus'
import YaMapPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/YaMapPauseLocationMarker'
import YaMapResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/YaMapResumeLocationMarker'
import YaMapStartLocationMarker from '@/components/map/markers/StartLocationMarker/YaMapStartLocationMarker'
import YaMapFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/YaMapFinishLocationMarker'
import YaMapUserLocationMarker from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { mapCenter, firstPoint, secondPoint, thirdPoint, fourthPoint, fifthPoint, sixthPoint } from '@/constants/RNMap'
import { processColor, useAnimatedProps } from 'react-native-reanimated'
import { YaMapAnimatedPolyline } from '@/components/map/YaMapAnimatedPolyline'
import type { PolylineNativeProps } from 'react-native-yamap-plus/src/spec/PolylineNativeComponent'
export type AnimatedYaMapPolylineProps = ReturnType<typeof useAnimatedProps<PolylineNativeProps>>

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
	animatedStrokeColorProps?: AnimatedYaMapPolylineProps
	animatedStrokeColorWithOpacityProps?: AnimatedYaMapPolylineProps
}

const YaMapComponentColorPick = (props: IYaMapComponentColorPickProps) => {
	const activeColor = props.activeColor ?? 'rgb(0, 200, 100, 1)'

	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className="overflow-hidden border-[1px] border-white/20"
			style={{
				width: '100%',
				height: '100%',
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
				<YaMapAnimatedPolyline
					points={[firstPoint, secondPoint]}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor={processColor('transparent')}
					animatedProps={props.animatedStrokeColorProps}
				/>
				<YaMapAnimatedPolyline
					points={[thirdPoint, fourthPoint]}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor={processColor('transparent')}
					animatedProps={props.animatedStrokeColorWithOpacityProps}
				/>
				<YaMapAnimatedPolyline
					points={[fifthPoint, sixthPoint]}
					strokeWidth={4}
					outlineWidth={2}
					outlineColor={processColor('transparent')}
					animatedProps={props.animatedStrokeColorProps}
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
