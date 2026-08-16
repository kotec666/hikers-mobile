import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 24 } = props

	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
			<Path
				stroke={props.color || '#fff'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="m7 15 5 5 5-5M7 9l5-5 5 5"
			/>
		</Svg>
	)
}
export default SvgComponent
