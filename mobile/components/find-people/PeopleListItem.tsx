import React from 'react'
import { View, Text } from 'react-native'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import { fontFamily } from '@/constants/Fonts'
import RoundedCheckMark from '@/components/svg/RoundedCheckMark'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import { FRIEND_STATUS } from '@/app/find-people'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface IProps {
	id: number
	name: string
	avatar: boolean
	status: FRIEND_STATUS
}

const PeopleListItem = (props: IProps) => {
	const renderIcon = () => {
		switch (props.status) {
			case 'added':
				return <PeopleRemoveSvg />
			case 'not-added':
				return <PeopleAddSvg />
			case 'sent':
				return <RoundedCheckMark />
		}
	}

	return (
		<View className="flex-row justify-between items-center">
			<View className="flex-row gap-[15px] items-center">
				<UserAvatar avatar={props.avatar} />
				<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
					{props.name}
				</Text>
			</View>
			<View>{renderIcon()}</View>
		</View>
	)
}

export default PeopleListItem
