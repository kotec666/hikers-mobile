import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#000', size = 13 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 13 13">
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M1.965 9.757c.022-.2.033-.301.064-.395a.97.97 0 0 1 .113-.235c.054-.083.125-.154.268-.297l6.41-6.41a1.373 1.373 0 1 1 1.942 1.941l-6.41 6.41a2.049 2.049 0 0 1-.297.27.971.971 0 0 1-.235.112 2.06 2.06 0 0 1-.395.064l-1.643.183.183-1.643Z"
		/>
	</Svg>
)
export default SvgComponent
