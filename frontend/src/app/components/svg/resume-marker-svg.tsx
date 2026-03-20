import { SvgIconProps } from './types'

const ResumeMarkerSvg = ({ size = 32, color = 'currentColor', ...props }: SvgIconProps) => {
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
						d="M18 10.268c1.333.77 1.333 2.694 0 3.464l-9 5.196c-1.333.77-3-.192-3-1.732V6.804c0-1.54 1.667-2.502 3-1.732l9 5.196Z"
					/>
				</svg>
			</g>
		</svg>
	)
}

export default ResumeMarkerSvg
