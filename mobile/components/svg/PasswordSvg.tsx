import * as React from "react"
import Svg, { Path } from "react-native-svg"

interface Props {
    error: boolean
}

const SvgComponent = (props: Props) => (
    <Svg
        width={20}
        height={20}
        fill="none"
        {...props}
    >
        <Path
            stroke={props.error ? '#FF0004' : '#ABABAB'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M12.333 8h.008m-.008 5C14.911 13 17 10.761 17 8s-2.09-5-4.667-5-4.666 2.239-4.666 5c0 .228.014.453.042.673.045.361.068.542.052.657a.745.745 0 0 1-.09.288c-.053.101-.146.2-.332.4l-3.975 4.258c-.134.144-.201.216-.25.3a.868.868 0 0 0-.093.241C3 14.913 3 15.015 3 15.22v1.448c0 .466 0 .7.085.878a.808.808 0 0 0 .34.364c.166.091.384.091.82.091h1.35c.19 0 .286 0 .376-.023a.75.75 0 0 0 .224-.1c.079-.051.146-.123.28-.267l3.975-4.26c.186-.198.279-.297.373-.354a.633.633 0 0 1 .27-.097c.106-.017.275.008.613.056.205.03.415.045.627.045Z"
        />
    </Svg>
)
export default SvgComponent
