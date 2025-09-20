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
			d="M4.85 13.672C3.091 14.448 2 15.529 2 16.725 2 19.086 6.253 21 11.5 21s9.5-1.914 9.5-4.275c0-1.196-1.091-2.277-2.85-3.053M17.2 7.7c0 3.86-4.275 5.7-5.7 8.55-1.425-2.85-5.7-4.69-5.7-8.55a5.7 5.7 0 0 1 11.4 0Zm-4.75 0a.95.95 0 1 1-1.9 0 .95.95 0 0 1 1.9 0Z"
		/>
	</Svg>
)
export default SvgComponent
