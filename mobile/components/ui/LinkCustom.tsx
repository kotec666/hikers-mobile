import { Link } from 'expo-router'
import { Text } from 'react-native'
import { LinkProps } from 'expo-router/build/link/Link'

export function LinkCustom({ text, ...props }: LinkProps & { text: string }) {
	return (
		<Link {...props}>
			<Text>{text}</Text>
		</Link>
	)
}
