import { SvgIconProps } from './types'

const BurgerSvg = ({ size = 24, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} {...props}>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	)
}

export default BurgerSvg
