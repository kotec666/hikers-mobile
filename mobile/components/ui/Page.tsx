import { ReactNode } from 'react'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'
import { StatusBar, StatusBarProps } from 'expo-status-bar'
import { DEFAULT_PADDING_TOP } from '@/constants/Variables'

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
				flex: 1,
				paddingTop: edges.includes('top') ? DEFAULT_PADDING_TOP : 0
			}}
		>
			{children}
			<StatusBar style="light" {...statusBarProps} />
		</SafeAreaView>
	)
}
