import React from 'react'
import { Pressable, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import { Colors } from '@/constants/Colors'

type TitlePart = {
	text: string
	color?: string
}

interface IProps {
	title: string | TitlePart[]
	onPress: () => void
}

const Setting = ({ title, onPress }: IProps) => {
	const renderTitle = () => {
		if (Array.isArray(title)) {
			return title.map((part, index) => (
				<Text key={index} style={{ color: part.color || Colors['gray-ab'] }}>
					{part.text}
				</Text>
			))
		}

		return title
	}

	return (
		<Pressable onPress={onPress} className="flex-row justify-between items-center">
			<Text className="text-base text-gray-ab flex-1 mr-2" style={{ fontFamily: fontFamily.medium }}>
				{renderTitle()}
			</Text>
			<ArrowDownSvg style={{ transform: [{ rotate: '-90deg' }] }} size={22} />
		</Pressable>
	)
}

export default Setting
