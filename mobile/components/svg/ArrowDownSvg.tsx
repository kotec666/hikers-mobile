import Svg, { Path } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'

interface IProps {
	size?: number
	style?: StyleProp<ViewStyle>
}

const SvgComponent = ({ size = 16, style }: IProps) => {
	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 16 16" style={style}>
			<Path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="m13 6-5 5-5-5" />
		</Svg>
	)
}
export default SvgComponent
