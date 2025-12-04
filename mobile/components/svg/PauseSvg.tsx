import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 23, height = 23 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 23 23">
			<Path
				fill={props.color || '#000'}
				d="M6 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5ZM14 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5Z"
			/>
		</Svg>
	)
}
export default SvgComponent
