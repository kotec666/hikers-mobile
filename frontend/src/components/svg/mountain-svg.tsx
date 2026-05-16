import { SvgIconProps } from './types'

const MountainSvg = ({ size = 24, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M8 3L12 11L17 6L22 21H2L8 3Z"
				stroke={color}
				strokeWidth="1.33"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default MountainSvg
