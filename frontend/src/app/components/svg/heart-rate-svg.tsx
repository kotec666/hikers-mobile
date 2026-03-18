import { SvgIconProps } from './types'

const HeartRateSvg = ({ size = 24, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M22 12H18L15 21L9 3L6 12H2"
				stroke={color}
				strokeWidth="1.33"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default HeartRateSvg
