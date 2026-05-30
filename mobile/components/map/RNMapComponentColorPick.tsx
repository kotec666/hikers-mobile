import React from 'react'
import { View } from 'react-native'
import MapView from 'react-native-maps'
import RNMapsPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/RNMapsPauseLocationMarker'
import RNMapsResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/RNMapsResumeLocationMarker'
import RNMapsStartLocationMarker from '@/components/map/markers/StartLocationMarker/RNMapsStartLocationMarker'
import RNMapsFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/RNMapsFinishLocationMarker'
import RNMapsUserLocationMarker from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import RNSegmentPolyline from '@/components/map/polyline/RNSegmentPolyline'
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
import { adjustRgbaOpacity } from '@/helpers/colors/adjustRgbaOpacity'

interface IProps {
	activeColor?: string
	interactiveDisabled?: boolean
	maxContainerHeight?: number
	rounded?: number
	// appleLogoPosition?: EdgePadding
	// appleLegalPosition?: EdgePadding
}

const getSegmentColor = (isPaused: boolean, userColor: string) => {
	if (isPaused) {
		return adjustRgbaOpacity(userColor, (a) => a / 2)
	}
	return userColor
}

const RNMapComponentColorPick = (props: IProps) => {
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
					key={`user-${activeColor}`}
					initialPosition={mapCenter}
					color={activeColor}
					debugAccuracyM={20}
				/>
				<RNMapsStartLocationMarker key={`start-${activeColor}`} position={firstPoint} color={activeColor} />
				<RNSegmentPolyline
					key={`poly-1-${activeColor}`}
					points={[firstPoint, secondPoint]}
					color={getSegmentColor(false, activeColor)}
				/>
				<RNSegmentPolyline
					key={`poly-2-${activeColor}`}
					points={[secondPoint, thirdPoint]}
					color={getSegmentColor(true, activeColor)}
				/>
				<RNSegmentPolyline
					key={`poly-3-${activeColor}`}
					points={[thirdPoint, fourthPoint]}
					color={getSegmentColor(true, activeColor)}
				/>
				<RNSegmentPolyline
					key={`poly-4-${activeColor}`}
					points={[fifthPoint, sixthPoint]}
					color={getSegmentColor(false, activeColor)}
				/>
				<RNMapsPauseLocationMarker key={`pause-1-${activeColor}`} position={secondPoint} color={activeColor} />
				<RNMapsResumeLocationMarker
					key={`resume-1-${activeColor}`}
					position={fourthPoint}
					color={activeColor}
				/>
				<RNMapsFinishLocationMarker key={`finish-${activeColor}`} position={sixthPoint} color={activeColor} />
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
