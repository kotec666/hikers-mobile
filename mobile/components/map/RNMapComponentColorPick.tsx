import React, { forwardRef, useImperativeHandle, useRef } from 'react'
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
import { MapPolylineProps } from 'react-native-maps/dist/src/MapPolyline'
import RNMapsUserLocationMarker, {
	RNMapsUserLocationMarkerHandle
} from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import RNMapsStartLocationMarker from '@/components/map/markers/StartLocationMarker/RNMapsStartLocationMarker'
import RNMapsPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/RNMapsPauseLocationMarker'
import RNMapsResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/RNMapsResumeLocationMarker'
import RNMapsFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/RNMapsFinishLocationMarker'
import { setRgbaOpacity } from '@/helpers/colors/setRgbaOpacity'

export interface IRNMapComponentColorPickProps {
	rnMapUserLocationMarkerRef: React.RefObject<RNMapsUserLocationMarkerHandle | null>
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

export interface RNMapColorPickHandle {
	setRNMapColor: (color: string) => void
}

const RNMapComponentColorPick = forwardRef<RNMapColorPickHandle, IRNMapComponentColorPickProps>((props, ref) => {
	const polylineRef1 = useRef<React.ComponentRef<typeof Polyline>>(null)
	const polylineRef2 = useRef<React.ComponentRef<typeof Polyline>>(null)
	const polylineRef3 = useRef<React.ComponentRef<typeof Polyline>>(null)

	useImperativeHandle(ref, () => ({
		setRNMapColor: (color: string) => {
			polylineRef1.current?.setNativeProps({ strokeColor: color })
			polylineRef2.current?.setNativeProps({ strokeColor: setRgbaOpacity(color, 0.5) })
			polylineRef3.current?.setNativeProps({ strokeColor: color })
		}
	}))

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
				<RNMapsUserLocationMarker
					ref={props.rnMapUserLocationMarkerRef}
					initialPosition={mapCenter}
					debugAccuracyM={20}
					animatedFillProps={props.animatedFillProps}
					animatedFillColorWithOpacityProps={props.animatedFillColorWithOpacityProps}
				/>

				<Polyline
					ref={polylineRef1}
					strokeWidth={4}
					strokeColor={props.activeColor ?? 'rgb(0, 200, 100)'}
					coordinates={[
						{ latitude: firstPoint.lat, longitude: firstPoint.lon },
						{ latitude: secondPoint.lat, longitude: secondPoint.lon }
					]}
				/>

				<Polyline
					ref={polylineRef2}
					strokeWidth={4}
					strokeColor={setRgbaOpacity(props.activeColor ?? 'rgb(0, 200, 100)', 0.5)}
					coordinates={[
						{ latitude: thirdPoint.lat, longitude: thirdPoint.lon },
						{ latitude: fourthPoint.lat, longitude: fourthPoint.lon }
					]}
				/>

				<Polyline
					ref={polylineRef3}
					strokeWidth={4}
					strokeColor={props.activeColor ?? 'rgb(0, 200, 100)'}
					coordinates={[
						{ latitude: fifthPoint.lat, longitude: fifthPoint.lon },
						{ latitude: sixthPoint.lat, longitude: sixthPoint.lon }
					]}
				/>
				<RNMapsStartLocationMarker position={firstPoint} animatedStrokeProps={props.animatedStrokeProps} />
				<RNMapsPauseLocationMarker position={secondPoint} animatedFillProps={props.animatedFillProps} />
				<RNMapsResumeLocationMarker position={fourthPoint} animatedFillProps={props.animatedFillProps} />
				<RNMapsFinishLocationMarker position={sixthPoint} animatedStrokeProps={props.animatedStrokeProps} />
			</MapView>
		</View>
	)
})

RNMapComponentColorPick.displayName = 'RNMapComponentColorPick'

export default React.memo(RNMapComponentColorPick, (prev, next) => {
	return (
		prev.rounded === next.rounded &&
		prev.activeColor === next.activeColor &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.interactiveDisabled === next.interactiveDisabled
	)
})
