import { SvgIconProps } from './types'

const PauseMarkerSvg = ({ size = 32, color = 'currentColor', ...props }: SvgIconProps) => {
	const centerX = size / 2
	const centerY = size / 2
	const circleRadius = 16

	const iconSize = 16
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
			<circle cx={centerX} cy={centerY} r={circleRadius} fill="white" strokeWidth={0} />
			<g transform={`translate(${centerX - iconSize / 2}, ${centerY - iconSize / 2})`}>
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 23 23"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill={props.fill || color}
						d="M6 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5ZM14 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5Z"
					/>
				</svg>
			</g>
		</svg>
	)
}

export default PauseMarkerSvg
