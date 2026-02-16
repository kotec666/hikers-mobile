import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Link } from 'expo-router'
import { useAuthStore } from '@/store/authStore'

interface IIcon {
	iconSvg: React.JSX.Element | null
	iconCb?: () => void
}

interface IProps {
	id: string
	name: string | null
	username: string | null
	avatar: string | null
	icon?: IIcon | IIcon[]
	isIconDisabled?: boolean
}

const PeopleListItem = (props: IProps) => {
	const { user } = useAuthStore()
	return (
		<View className="flex-row justify-between items-center w-full">
			<Link
				href={{
					pathname: props.id === user?.id ? '/(tabs)/profile' : '/user/profile/[id]',
					params: { id: props.id }
				}}
				className="flex-1"
			>
				<View className="flex-row gap-[15px] items-center">
					<UserAvatar avatar={props.avatar} />
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
						{props.id === user?.id ? 'Вы' : `${props.name || props.username || '-'}`}
					</Text>
				</View>
			</Link>
			{props.icon && Array.isArray(props.icon) ? (
				<View className="flex-row gap-3">
					{props.icon.map((iconItem, index) => (
						<TouchableOpacity onPress={iconItem.iconCb} disabled={props.isIconDisabled} key={index}>
							{iconItem.iconSvg}
						</TouchableOpacity>
					))}
				</View>
			) : (
				<TouchableOpacity onPress={props.icon?.iconCb} disabled={props.isIconDisabled}>
					{props.icon?.iconSvg}
				</TouchableOpacity>
			)}
		</View>
	)
}

export default PeopleListItem
