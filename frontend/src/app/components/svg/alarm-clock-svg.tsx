import { SvgIconProps } from './types'

const AlarmClockSvg = ({ size = 24, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z"
				stroke={color}
				strokeWidth="1.33"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M12 9V13L14 15" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M5 3L2 6" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M22 6L19 3" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M6 19L4 21" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M18 19L20 21" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

export default AlarmClockSvg
