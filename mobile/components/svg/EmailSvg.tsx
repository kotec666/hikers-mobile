import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
	error: boolean;
}

const SvgComponent = (props: Props) => (
	<Svg width={20} height={20} fill="none">
		<Path
			stroke={props.error ? '#FF0004' : '#ABABAB'}
			strokeLinecap="round"
			strokeWidth={1.6}
			d="M12.071 17.727A8 8 0 1 1 18 10v1.334a2.222 2.222 0 1 1-4.444 0v-4m0 2.666a3.556 3.556 0 1 1-7.112 0 3.556 3.556 0 0 1 7.112 0Z"
		/>
	</Svg>
);
export default SvgComponent;
