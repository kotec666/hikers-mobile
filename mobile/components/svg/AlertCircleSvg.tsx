import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg'
import * as React from 'react'

interface IProps {
	size?: number
}

const SvgComponent = ({ size = 16 }: IProps) => {
	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 16	16">
			<G stroke="#F44" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.33} clipPath="url(#a)">
				<Path d="M8 14.667A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.334ZM8 5.333V8M8 10.667h.007" />
			</G>
			<Defs>
				<ClipPath id="a">
					<Path fill="#fff" d="M0 0h16v16H0z" />
				</ClipPath>
			</Defs>
		</Svg>
	)
}
export default SvgComponent
