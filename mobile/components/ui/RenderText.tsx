import React from 'react'
import { StyleProp, Text, TextStyle, View } from 'react-native'

const RenderText = ({
	textBlocks
}: {
	textBlocks: { text: string; className: string; style: StyleProp<TextStyle> }[]
}) => {
	return (
		<View>
			{textBlocks.map((textItem) => (
				<Text key={textItem.text} className={textItem.className} style={textItem.style}>
					{textItem.text}
				</Text>
			))}
		</View>
	)
}

export default RenderText
