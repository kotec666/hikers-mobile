import Svg, { Path } from 'react-native-svg'
import * as React from 'react'

interface IProps {
	size?: number
}

const SvgComponent = ({ size = 20 }: IProps) => {
	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 20	20">
			<Path
				stroke="#9A9A9A"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.33}
				d="M16.666 3.333H3.333c-.92 0-1.667.747-1.667 1.667v10c0 .92.747 1.667 1.667 1.667h13.334c.92 0 1.666-.747 1.666-1.667V5c0-.92-.746-1.667-1.666-1.667Z"
			/>
			<Path
				stroke="#9A9A9A"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.33}
				d="m18.333 5.833-7.475 4.75a1.617 1.617 0 0 1-1.716 0l-7.475-4.75"
			/>
		</Svg>
	)
}
export default SvgComponent
