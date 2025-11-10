import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 24, height = 24 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 24 24">
			<Path
				stroke={props.color || '#FFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15 17v1a3 3 0 1 1-6 0v-1m6 0H9m6 0h4a1 1 0 0 0 1-1v-.586a1 1 0 0 0-.293-.707l-.51-.51a.67.67 0 0 1-.197-.475V10c0-.176-.006-.351-.02-.524M9 17H5a1 1 0 0 1-1-1v-.586a1 1 0 0 1 .293-.707l.51-.511A.669.669 0 0 0 5 13.722V10a7 7 0 0 1 9.045-6.696m4.935 6.172a4 4 0 1 0-4.935-6.173m4.935 6.173a4 4 0 0 1-4.935-6.173m4.935 6.173s0 0 0 0Zm-4.935-6.172h.002"
			/>
		</Svg>
	)
}
export default SvgComponent
