import React from 'react'
import { Pressable, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IMoreOptionsListItemProps {
	label: string
	action: () => void
}

const MoreOptionsListItem = (props: IMoreOptionsListItemProps) => {
	return (
		<Pressable onPress={props.action}>
			<Text
				className="text-sm text-white text-nowrap whitespace-nowrap"
				style={{ fontFamily: fontFamily.regular }}
			>
				{props.label}
			</Text>
		</Pressable>
	)
}

export default MoreOptionsListItem
