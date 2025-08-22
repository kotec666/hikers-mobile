import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const SvgComponent = () => (
	<Svg width={12} height={12} fill="none">
		<Path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10 4 4.5 9 2 6.727" />
	</Svg>
);
export default SvgComponent;
