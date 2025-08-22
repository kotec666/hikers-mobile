import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
	color?: string;
	opened: boolean;
};

const SvgComponent = (props: Props) => {
	if (!props.opened)
		return (
			<Svg width={28} height={28} fill="none" {...props}>
				<Path
					stroke={props.color || '#FFFFFF'}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.6}
					d="M12.467 6.557A10.442 10.442 0 0 1 14 6.444c6.223 0 10.306 5.506 11.678 7.684.166.264.25.396.296.599.035.153.035.394 0 .546-.047.204-.13.336-.297.602-.366.58-.923 1.395-1.662 2.279M7.568 8.54c-2.635 1.792-4.424 4.283-5.245 5.585-.167.265-.25.398-.297.6a1.438 1.438 0 0 0 0 .547c.047.203.13.335.296.599C3.694 18.05 7.777 23.556 14 23.556c2.51 0 4.67-.896 6.447-2.107M3.029 4l21.942 22M11.414 12.407A3.66 3.66 0 0 0 10.343 15 3.662 3.662 0 0 0 14 18.667a3.64 3.64 0 0 0 2.586-1.074"
				/>
			</Svg>
		);

	return (
		<Svg width={28} height={28} fill="none" {...props}>
			<Path
				stroke={props.color || '#FFFFFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M2.322 15.366c-.166-.262-.25-.393-.296-.595a1.419 1.419 0 0 1 0-.542c.047-.202.13-.333.296-.595C3.694 11.47 7.777 6 14 6c6.223 0 10.306 5.47 11.678 7.634.166.262.25.393.296.595.035.151.035.39 0 .542-.047.202-.13.333-.296.595C24.306 17.53 20.223 23 14 23c-6.223 0-10.306-5.47-11.678-7.634Z"
			/>
			<Path
				stroke={props.color || '#FFFFFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M14 18.143a3.65 3.65 0 0 0 3.657-3.643A3.65 3.65 0 0 0 14 10.857a3.65 3.65 0 0 0-3.657 3.643A3.65 3.65 0 0 0 14 18.143Z"
			/>
		</Svg>
	);
};
export default SvgComponent;
