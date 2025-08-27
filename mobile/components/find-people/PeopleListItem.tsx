import React from 'react'
import { View, Text, Image } from 'react-native'
import PeopleSvg from '@/components/svg/PeopleSvg'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import { fontFamily } from '@/constants/Fonts'
import RoundedCheckMark from '@/components/svg/RoundedCheckMark'

interface IProps {
	id: number
	name: string
	avatar: boolean
	isAdded: boolean
}

const PeopleListItem = (props: IProps) => {
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
			<View>{props.isAdded ? <PeopleAddSvg /> : <RoundedCheckMark />}</View>
		</View>
	)
}

export default PeopleListItem
