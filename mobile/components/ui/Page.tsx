import { ReactNode } from 'react'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'
import { StatusBar, StatusBarProps } from 'expo-status-bar'

type Props = {
	children: ReactNode
	edges?: Edge[]
	statusBarProps?: StatusBarProps
}

export function Page({ children, statusBarProps, edges = ['top', 'bottom'] }: Props) {
	return (
		<SafeAreaView
			edges={edges}
			style={{
				flex: 1
			}}
		>
			{children}
			<StatusBar style="light" {...statusBarProps} />
		</SafeAreaView>
	)
}
