import { SvgIconProps } from './types'

const PersonSvg = ({ size = 22, color = 'currentColor', ...props }: SvgIconProps) => {
	return (
		<svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path
				d="M19 20C19 18.6044 19 17.9067 18.8278 17.3389C18.44 16.0605 17.4395 15.06 16.1611 14.6722C15.5933 14.5 14.8956 14.5 13.5 14.5H8.5C7.10444 14.5 6.40665 14.5 5.83886 14.6722C4.56045 15.06 3.56004 16.0605 3.17224 17.3389C3 17.9067 3 18.6044 3 20M15.5 6.5C15.5 8.98528 13.4853 11 11 11C8.51472 11 6.5 8.98528 6.5 6.5C6.5 4.01472 8.51472 2 11 2C13.4853 2 15.5 4.01472 15.5 6.5Z"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default PersonSvg
