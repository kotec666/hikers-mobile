import React from 'react'
import { View } from 'react-native'
import MapView, { Polyline } from 'react-native-maps'
import {
	mapCenter,
	// DEFAULT_APPLE_LEGAL_POSITION,
	// DEFAULT_APPLE_LOGO_POSITION,
	firstPoint,
	secondPoint,
	thirdPoint,
	fourthPoint,
	fifthPoint,
	sixthPoint
} from '@/constants/RNMap'
import Animated from 'react-native-reanimated'
import { MapPolylineProps } from 'react-native-maps/dist/src/MapPolyline'
import RNMapsAnimatedStartLocationMarker from '@/components/map/markers/StartLocationMarker/RNMapsAnimatedStartLocationMarker'
import RNMapsAnimatedPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/RNMapsAnimatedPauseLocationMarker'
import RNMapsAnimatedResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/RNMapsAnimatedResumeLocationMarker'
import RNMapsAnimatedFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/RNMapsAnimatedFinishLocationMarker'
import RNMapsAnimatedUserLocationMarker from '@/components/map/markers/UserLocationMarker/RNMapsAnimatedUserLocationMarker'

export interface IRNMapComponentColorPickProps {
	activeColor?: string
	interactiveDisabled?: boolean
	maxContainerHeight?: number
	rounded?: number
	// appleLogoPosition?: EdgePadding
	// appleLegalPosition?: EdgePadding
	animatedStrokeColorProps?: Partial<MapPolylineProps>
	animatedStrokeColorWithOpacityProps?: Partial<MapPolylineProps>
	animatedStrokeProps?: Partial<{ stroke: string }>
	animatedFillProps?: Partial<{ fill: string }>
	animatedFillColorProps?: Partial<{ fillColor: string }>
	animatedFillColorWithOpacityProps?: Partial<{ fillColor: string }>
}

export const AnimatedPolyline = Animated.createAnimatedComponent(Polyline)
const RNMapComponentColorPick = (props: IRNMapComponentColorPickProps) => {
	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className="flex-1 overflow-hidden border-[1px] border-white/20"
			style={{
				borderRadius: props.rounded || 0,
				maxHeight: props.maxContainerHeight ?? 'auto'
			}}
		>
			<MapView
				userInterfaceStyle="dark"
				initialCamera={{
					center: { latitude: mapCenter.lat, longitude: mapCenter.lon },
					altitude: 350, // аналог zoom
					heading: 0,
					pitch: 0
				}}
				style={{ height: '100%', width: '100%' }}
				// appleLogoInsets={props.appleLogoPosition || DEFAULT_APPLE_LOGO_POSITION}
				// legalLabelInsets={props.appleLegalPosition || DEFAULT_APPLE_LEGAL_POSITION}
				scrollEnabled={!props.interactiveDisabled}
				zoomEnabled={!props.interactiveDisabled}
				pitchEnabled={!props.interactiveDisabled}
				rotateEnabled={false}
				showsCompass={false}
				showsScale
			>
				<RNMapsAnimatedUserLocationMarker
					initialPosition={mapCenter}
					debugAccuracyM={20}
					animatedFillProps={props.animatedFillProps}
					animatedFillColorWithOpacityProps={props.animatedFillColorWithOpacityProps}
				/>
				<RNMapsAnimatedStartLocationMarker
					position={firstPoint}
					animatedCircleProps={props.animatedStrokeProps}
				/>

				<AnimatedPolyline
					strokeWidth={4}
					coordinates={[
						{ latitude: firstPoint.lat, longitude: firstPoint.lon },
						{ latitude: secondPoint.lat, longitude: secondPoint.lon }
					]}
					animatedProps={props.animatedStrokeColorProps}
				/>

				<AnimatedPolyline
					strokeWidth={4}
					coordinates={[
						{ latitude: thirdPoint.lat, longitude: thirdPoint.lon },
						{ latitude: fourthPoint.lat, longitude: fourthPoint.lon }
					]}
					animatedProps={props.animatedStrokeColorWithOpacityProps}
				/>

				<AnimatedPolyline
					strokeWidth={4}
					coordinates={[
						{ latitude: fifthPoint.lat, longitude: fifthPoint.lon },
						{ latitude: sixthPoint.lat, longitude: sixthPoint.lon }
					]}
					animatedProps={props.animatedStrokeColorProps}
				/>
				<RNMapsAnimatedPauseLocationMarker position={secondPoint} animatedPathProps={props.animatedFillProps} />
				<RNMapsAnimatedResumeLocationMarker
					position={fourthPoint}
					animatedPathProps={props.animatedFillProps}
				/>
				<RNMapsAnimatedFinishLocationMarker
					position={sixthPoint}
					animatedPathProps={props.animatedStrokeProps}
				/>
			</MapView>
		</View>
	)
}

export default React.memo(RNMapComponentColorPick, (prev, next) => {
	return (
		prev.rounded === next.rounded &&
		prev.activeColor === next.activeColor &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.interactiveDisabled === next.interactiveDisabled
	)
})
