import { Yamap } from 'react-native-yamap-plus'
import React from 'react'
import { Platform, View } from 'react-native'
import YaMapPauseLocationMarker from '@/components/map/markers/PauseLocationMarker/YaMapPauseLocationMarker'
import YaMapResumeLocationMarker from '@/components/map/markers/ResumeLocationMarker/YaMapResumeLocationMarker'
import YaMapStartLocationMarker from '@/components/map/markers/StartLocationMarker/YaMapStartLocationMarker'
import YaMapFinishLocationMarker from '@/components/map/markers/FinishLocationMarker/YaMapFinishLocationMarker'
import { PolylineCustom } from '@/components/map/PolylineCustom'
import YaMapUserLocationMarker from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { adjustRgbaOpacity } from '@/helpers/colors/adjustRgbaOpacity'

interface IProps {
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

// paused: false
const firstPoint = { lat: 56.31378765571552, lon: 43.99060212937605 }
const secondPoint = { lat: 56.31464454498599, lon: 43.99157577124938 }

// paused: true
const thirdPoint = { lat: 56.31464454498599, lon: 43.99157577124938 }
const fourthPoint = { lat: 56.314405034469836, lon: 43.99221950141364 }

// paused: false
const fifthPoint = { lat: 56.314405034469836, lon: 43.99221950141364 }
const sixthPoint = { lat: 56.31355855359197, lon: 43.991256588376274 }

const mapCenter = {
	lat: 56.31415659650883,
	lon: 43.99145507184358
}

const getSegmentColor = (isPaused: boolean, userColor: string) => {
	if (isPaused) {
		return adjustRgbaOpacity(userColor, (a) => a / 2)
	}
	return userColor
}

// @TODO проверить apple maps
const MapComponentColorPick = (props: IProps) => {
	const activeColor = props.activeColor ?? 'rgb(0, 200, 100, 1)'
	const isIOS = Platform.OS === 'ios' // @TODO убрать
	return (
		<View
			pointerEvents={props.interactiveDisabled ? 'none' : 'auto'}
			className="flex-1 overflow-hidden border-[1px] border-white/20"
			style={{
				overflow: 'hidden',
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
					outlineWidth={isIOS ? 0 : 2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-2-${activeColor}`}
					points={[secondPoint, thirdPoint]}
					strokeColor={getSegmentColor(true, activeColor)}
					strokeWidth={4}
					outlineWidth={isIOS ? 0 : 2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-3-${activeColor}`}
					points={[thirdPoint, fourthPoint]}
					strokeColor={getSegmentColor(true, activeColor)}
					strokeWidth={4}
					outlineWidth={isIOS ? 0 : 2}
					outlineColor="transparent"
				/>
				<PolylineCustom
					key={`poly-4-${activeColor}`}
					points={[fifthPoint, sixthPoint]}
					strokeColor={getSegmentColor(false, activeColor)}
					strokeWidth={4}
					outlineWidth={isIOS ? 0 : 2}
					outlineColor="transparent"
				/>
				<YaMapPauseLocationMarker key={`pause-1-${activeColor}`} position={secondPoint} color={activeColor} />
				<YaMapResumeLocationMarker key={`resume-1-${activeColor}`} position={fourthPoint} color={activeColor} />
				<YaMapFinishLocationMarker key={`finish-${activeColor}`} position={sixthPoint} color={activeColor} />
			</Yamap>
		</View>
	)
}

export default React.memo(MapComponentColorPick, (prev, next) => {
	return (
		prev.activeColor === next.activeColor &&
		prev.maxContainerHeight === next.maxContainerHeight &&
		prev.rounded === next.rounded &&
		prev.interactiveDisabled === next.interactiveDisabled
	)
})
