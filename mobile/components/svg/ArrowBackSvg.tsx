import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const SvgComponent = () => (
	<Svg width={25} height={25} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M3 12.5 9.536 19M3 12.5 9.536 6M3 12.5h20"
		/>
	</Svg>
);
export default SvgComponent;
