import { ReactNode } from 'react'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'

type Props = {
	children: ReactNode
	edges?: Edge[]
}

export function Page({ children, edges = ['top', 'bottom'] }: Props) {
	return (
		<SafeAreaView
			edges={edges}
			style={{
				flex: 1
			}}
		>
			{children}
		</SafeAreaView>
	)
}
