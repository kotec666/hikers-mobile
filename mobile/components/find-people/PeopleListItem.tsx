import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Link } from 'expo-router'

interface IProps {
	id: number
	name: string
	avatar: boolean
	icon?: React.JSX.Element | React.JSX.Element[]
}

const PeopleListItem = (props: IProps) => {
	return (
		<Link href="/">
			<View className="flex-row justify-between items-center w-full">
				<View className="flex-row gap-[15px] items-center">
					<UserAvatar avatar={props.avatar} />
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
						{props.name}
					</Text>
				</View>
				{props.icon && Array.isArray(props.icon) ? (
					<View className="flex-row gap-3">
						{props.icon.map((icon, index) => (
							<View key={index}>{icon}</View>
						))}
					</View>
				) : (
					<View>{props.icon}</View>
				)}
			</View>
		</Link>
	)
}

export default PeopleListItem
