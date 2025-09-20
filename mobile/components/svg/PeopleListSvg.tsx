import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
}

const SvgComponent = (props: IProps) => (
	<Svg width={23} height={23} fill="none">
		<Path
			stroke={props.color || '#000'}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M21 20v-1.889c0-1.76-1.211-3.24-2.85-3.659M14.825 3.275A3.78 3.78 0 0 1 17.2 6.778a3.78 3.78 0 0 1-2.375 3.503M16.25 20c0-1.76 0-2.64-.29-3.335a3.789 3.789 0 0 0-2.056-2.044c-.698-.288-1.583-.288-3.354-.288H7.7c-1.77 0-2.656 0-3.354.288a3.789 3.789 0 0 0-2.057 2.044C2 17.36 2 18.24 2 20M12.925 6.778c0 2.086-1.701 3.778-3.8 3.778-2.099 0-3.8-1.692-3.8-3.778C5.325 4.69 7.026 3 9.125 3c2.099 0 3.8 1.691 3.8 3.778Z"
		/>
	</Svg>
)
export default SvgComponent
