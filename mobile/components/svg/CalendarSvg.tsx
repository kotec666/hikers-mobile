import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 22, color = '#fff' } = props

	return (
		<Svg width={size} height={size} fill="none">
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M7.334 3.667H6.6c-1.027 0-1.541 0-1.933.2a1.832 1.832 0 0 0-.801.8c-.2.393-.2.907-.2 1.933v.734m3.667-3.667h7.333m-7.333 0V1.834m7.333 1.833h.733c1.027 0 1.54 0 1.932.2.345.175.626.456.802.8.2.392.2.906.2 1.93v.736m-3.667-3.666V1.834m-11 5.5V15.4c0 1.027 0 1.54.2 1.932.176.345.456.626.8.802.393.2.906.2 1.93.2h8.806c1.025 0 1.537 0 1.93-.2.344-.176.625-.457.801-.802.2-.391.2-.904.2-1.929v-8.07m-14.667 0h14.667m-3.667 7.334h.002v.002h-.002v-.002Zm-3.667 0h.002v.002H11v-.002Zm-3.666 0h.001v.002h-.001v-.002ZM14.669 11v.002h-.002V11h.002ZM11 11h.002v.002H11V11Zm-3.666 0h.001v.002h-.001V11Z"
			/>
		</Svg>
	)
}
export default SvgComponent
