import { ReactNode } from 'react'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'
import { StatusBar, StatusBarProps } from 'expo-status-bar'
import { DEFAULT_PADDING_TOP } from '@/constants/Variables'
import { Colors } from '@/constants/Colors'
import { StyleProp, ViewStyle } from 'react-native'

type Props = {
	children: ReactNode
	edges?: Edge[]
	statusBarProps?: StatusBarProps
	style?: StyleProp<ViewStyle>
}

export function Page({ children, statusBarProps, edges = ['top', 'bottom'], style }: Props) {
	return (
		<SafeAreaView
			edges={edges}
			style={[
				{
					flex: 1,
					paddingTop: edges.includes('top') ? DEFAULT_PADDING_TOP : 0,
					backgroundColor: Colors['black-0d']
				},
				style
			]}
		>
			{children}
			<StatusBar style="light" {...statusBarProps} />
		</SafeAreaView>
	)
}
