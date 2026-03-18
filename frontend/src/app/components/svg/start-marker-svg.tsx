import { SvgIconProps } from './types'

const StartMarkerSvg = ({ size = 32, color = 'currentColor', ...props }: SvgIconProps) => {
	const centerX = size / 2
	const centerY = size / 2
	const circleRadius = 11

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={{
				width: size,
				height: size
			}}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle
				cx={centerX}
				cy={centerY}
				r={circleRadius}
				fill="#fff"
				stroke={color}
				strokeWidth={circleRadius - 2}
			/>
		</svg>
	)
}

export default StartMarkerSvg
