import React from 'react'
import { Host, Toggle as SwiftToggle } from '@expo/ui/swift-ui'
import { ToggleProps } from './Toggle.types'
import { opacity } from '@expo/ui/swift-ui/modifiers'

const Toggle: React.FC<ToggleProps> = ({ value, onChange, label, disabled }) => {
	return (
		<Host matchContents>
			<SwiftToggle
				isOn={value}
				onIsOnChange={disabled ? () => {} : onChange}
				label={label}
				modifiers={[opacity(disabled ? 0.5 : 1)]}
			/>
		</Host>
	)
}

export default Toggle
