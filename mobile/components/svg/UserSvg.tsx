import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { cn } from '@/helpers/cn'

interface IProps {
	className?: string
}

const SvgComponent = (props: IProps) => (
	<Svg width={16} height={16} fill="none" className={cn('', props.className)} {...props}>
		<Path
			stroke="#000"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M13 14c0-.93 0-1.396-.118-1.774a2.71 2.71 0 0 0-1.834-1.778c-.39-.115-.87-.115-1.83-.115H5.782c-.96 0-1.439 0-1.83.115a2.71 2.71 0 0 0-1.833 1.778C2 12.604 2 13.07 2 14m8.594-9c0 1.657-1.385 3-3.094 3-1.709 0-3.094-1.343-3.094-3S5.791 2 7.5 2c1.709 0 3.094 1.343 3.094 3Z"
		/>
	</Svg>
)
export default SvgComponent
