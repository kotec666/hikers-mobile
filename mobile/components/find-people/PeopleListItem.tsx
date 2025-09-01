import React from 'react'
import { View, Text, Image } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import { fontFamily } from '@/constants/Fonts'
import RoundedCheckMark from '@/components/svg/RoundedCheckMark'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import { FRIEND_STATUS } from '@/app/find-people'

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
				{props.avatar ? (
					<Image
						source={require('@/assets/images/carousel/carousel-2.webp')}
						className="h-[50px] w-[50px] rounded-full"
					/>
				) : (
					<View className="h-[50px] w-[50px] justify-center items-center bg-blue-98 rounded-full">
						<PeopleSvg />
					</View>
				)}
				<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-base">
					{props.name}
				</Text>
			</View>
			<View>{renderIcon()}</View>
		</View>
	)
}

export default PeopleListItem
