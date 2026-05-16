import { SvgIconProps } from './types'

const DumbbellSvg = ({ size = 24, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M6.5 6.5L17.5 17.5"
				stroke={color}
				strokeWidth="1.33"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M21 21L20 20" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M3 3L4 4" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M18 22L22 18" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M2 6L6 2" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M3 10L10 3" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M14 21L21 14" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export default DumbbellSvg
