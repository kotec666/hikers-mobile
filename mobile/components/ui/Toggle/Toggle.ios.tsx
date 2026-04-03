import React from 'react'
import { Host, Toggle as SwiftToggle } from '@expo/ui/swift-ui'
import { ToggleProps } from './Toggle.types'

const ToggleIOS: React.FC<ToggleProps> = ({ value, onChange, label }) => {
	return (
		<Host matchContents>
			<SwiftToggle isOn={value} onIsOnChange={onChange} label={label} />
		</Host>
	)
}

export default ToggleIOS
