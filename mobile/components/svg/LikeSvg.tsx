import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	isPressed?: boolean
}

const SvgComponent = (props: IProps) => {
	if (props.isPressed) {
		return (
			<Svg width={25} height={25} fill="none">
				<Path
					fill="#20DC52"
					d="M20.86 20.329C20.627 21.866 19.336 23 17.818 23H4.05C2.918 23 2 22.06 2 20.9v-7.35c0-1.16.918-2.1 2.05-2.1h2.41c.406 0 .773-.244.938-.624l3.609-8.313a.842.842 0 0 1 .77-.513c1.396 0 2.528 1.16 2.528 2.59V8.3c0 .58.46 1.05 1.026 1.05h3.592c1.885 0 3.327 1.72 3.04 3.629l-1.104 7.35Z"
				/>
				<Path
					stroke="#20DC52"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.6}
					d="M7.127 23V11.45M2 13.55v7.35c0 1.16.918 2.1 2.05 2.1H17.82c1.518 0 2.81-1.134 3.04-2.671l1.105-7.35c.286-1.908-1.156-3.629-3.041-3.629h-3.592c-.567 0-1.026-.47-1.026-1.05V4.59c0-1.43-1.132-2.59-2.528-2.59-.333 0-.635.2-.77.513l-3.61 8.313c-.164.38-.531.624-.936.624H4.05c-1.133 0-2.051.94-2.051 2.1Z"
				/>
			</Svg>
		)
	}
	return (
		<Svg width={25} height={25} fill="none">
			<Path
				stroke="#fff"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M8.127 23V11.45M3 13.55v7.35c0 1.16.918 2.1 2.05 2.1H18.82c1.518 0 2.81-1.134 3.04-2.671l1.105-7.35c.286-1.908-1.156-3.629-3.041-3.629h-3.592c-.567 0-1.026-.47-1.026-1.05V4.59c0-1.43-1.132-2.59-2.528-2.59-.333 0-.635.2-.77.513l-3.61 8.313c-.164.38-.531.624-.936.624H5.05c-1.133 0-2.051.94-2.051 2.1Z"
			/>
		</Svg>
	)
}
export default SvgComponent
