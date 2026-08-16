import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#fff', size = 19 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 19 19">
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.33}
			d="M9.5 11.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
		/>
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.33}
			d="M14.546 11.546a1.125 1.125 0 0 0 .225 1.24l.04.041a1.364 1.364 0 1 1-1.93 1.93l-.04-.041a1.125 1.125 0 0 0-1.241-.225 1.125 1.125 0 0 0-.682 1.03v.115a1.364 1.364 0 0 1-2.727 0v-.061a1.125 1.125 0 0 0-.736-1.03 1.125 1.125 0 0 0-1.241.226l-.041.04a1.365 1.365 0 1 1-1.93-1.93l.041-.04A1.125 1.125 0 0 0 4.51 11.6a1.125 1.125 0 0 0-1.03-.682h-.115a1.364 1.364 0 0 1 0-2.727h.061a1.125 1.125 0 0 0 1.03-.736 1.125 1.125 0 0 0-.225-1.241l-.041-.041a1.364 1.364 0 1 1 1.93-1.93l.04.041A1.125 1.125 0 0 0 7.4 4.51h.055a1.125 1.125 0 0 0 .681-1.03v-.115a1.364 1.364 0 0 1 2.728 0v.061a1.125 1.125 0 0 0 .681 1.03 1.125 1.125 0 0 0 1.241-.225l.041-.041a1.363 1.363 0 0 1 2.226.442 1.364 1.364 0 0 1-.296 1.487l-.041.041A1.125 1.125 0 0 0 14.49 7.4v.055a1.124 1.124 0 0 0 1.03.681h.115a1.364 1.364 0 0 1 0 2.728h-.061a1.125 1.125 0 0 0-1.03.681Z"
		/>
	</Svg>
)
export default SvgComponent
