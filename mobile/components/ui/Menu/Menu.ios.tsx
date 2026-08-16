import { Button, Host, Menu as SwiftUIMenu, RNHostView } from '@expo/ui/swift-ui'
import { disabled as disabledModifier } from '@expo/ui/swift-ui/modifiers'
import { Text } from 'react-native'
import { MenuAction, MenuProps } from './Menu.types'

function renderAction(action: MenuAction) {
	const modifiers = action.disabled ? [disabledModifier()] : undefined

	return (
		<Button
			key={action.id}
			label={action.title}
			systemImage={action.image}
			role={action.destructive ? 'destructive' : undefined}
			modifiers={modifiers}
			onPress={action.onPress}
		/>
	)
}

export function Menu({ actions, children }: MenuProps) {
	return (
		<Host colorScheme="dark" matchContents>
			<SwiftUIMenu
				label={
					<RNHostView matchContents>
						<>{children ?? <Text style={{ fontSize: 20, color: 'white' }}>⋯</Text>}</>
					</RNHostView>
				}
			>
				{actions.map(renderAction)}
			</SwiftUIMenu>
		</Host>
	)
}
