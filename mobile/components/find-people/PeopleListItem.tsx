import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Link } from 'expo-router'

interface IIcon {
	iconSvg: React.JSX.Element
	iconCb?: () => void
}

interface IProps {
	id: string
	name: string | null
	username: string | null
	avatar: string | null
	icon?: IIcon | IIcon[]
}

const PeopleListItem = (props: IProps) => {
	return (
		<View className="flex-row justify-between items-center w-full">
			<Link href={`/user/profile/${props.id}`} className="flex-1">
				<View className="flex-row gap-[15px] items-center">
					<UserAvatar avatar={props.avatar} />
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
						{props.name || props.username || '-'}
					</Text>
				</View>
			</Link>
			{props.icon && Array.isArray(props.icon) ? (
				<View className="flex-row gap-3">
					{props.icon.map((iconItem, index) => (
						<TouchableOpacity onPress={iconItem.iconCb} key={index}>
							{iconItem.iconSvg}
						</TouchableOpacity>
					))}
				</View>
			) : (
				<TouchableOpacity onPress={props.icon?.iconCb}>{props.icon?.iconSvg}</TouchableOpacity>
			)}
		</View>
	)
}

export default PeopleListItem
