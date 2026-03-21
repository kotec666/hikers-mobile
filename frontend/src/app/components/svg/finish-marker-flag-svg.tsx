import { SvgIconProps } from './types'

const FinishMarkerFlagSvg = ({ size = 32, color = 'currentColor', ...props }: SvgIconProps) => {
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
					viewBox="0 0 14 14"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3 8.48s.498-.5 1.994-.5c1.495 0 2.492.998 3.987.998s1.994-.499 1.994-.499V2.997s-.499.498-1.994.498-2.492-.997-3.987-.997C3.498 2.498 3 2.997 3 2.997m0 8.971V2"
						stroke={props.fill || color}
						strokeWidth={1.6}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</g>
		</svg>
	)
}

export default FinishMarkerFlagSvg
