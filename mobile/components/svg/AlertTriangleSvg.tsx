import Svg, { Path } from 'react-native-svg'

interface IProps {
	size?: number
	color?: string
}

const SvgComponent = ({ size = 22, color = '#fff' }: IProps) => {
	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 22 22">
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M11 8.25v3.667m0 3.666h.01M9.73 3.567 2.192 16.59c-.418.722-.627 1.084-.596 1.38a.917.917 0 0 0 .372.646c.241.176.659.176 1.493.176h15.08c.834 0 1.251 0 1.492-.176a.917.917 0 0 0 .373-.646c.031-.296-.178-.658-.596-1.38l-7.54-13.023c-.417-.72-.625-1.08-.897-1.2a.917.917 0 0 0-.745 0c-.271.12-.48.48-.896 1.2Z"
			/>
		</Svg>
	)
}
export default SvgComponent
