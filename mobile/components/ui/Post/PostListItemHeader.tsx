import React from 'react'
import { Text, View } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import { cn } from '@/helpers/cn'
import PlusIconSvg from '@/components/svg/PlusIconSvg'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'

interface IProps {
	isSubscribed: boolean
	isMyPost?: boolean
}

const PostListItemHeader = ({ isSubscribed, isMyPost }: IProps) => {
	return (
		<>
			<View className="flex-row justify-between w-full">
				<View className="flex-row gap-[16px] items-center">
					<UserAvatar bordered avatar={true} />
					<View className="gap-[5px]">
						<Text className="text-white text-[17px]" style={{ fontFamily: fontFamily.bold }}>
							Сергей Авдотьев
						</Text>
						<View className="flex-row items-center gap-[8px]">
							<View className="w-[25px] h-[25px] bg-white rounded-[8px] items-center justify-center">
								<PeopleRunningSvg />
							</View>
							<View>
								<Text className="text-[13px] text-gray-ab" style={{ fontFamily: fontFamily.regular }}>
									Вчера
								</Text>
							</View>
						</View>
					</View>
				</View>
				{!isMyPost && (
					<View>
						<View
							className={cn('w-[50px] h-[50px] rounded-full items-center justify-center', {
								'bg-white': !isSubscribed,
								'bg-green-main': isSubscribed
							})}
						>
							{!isSubscribed ? <PlusIconSvg /> : <CheckMarkIconSvg />}
						</View>
					</View>
				)}
			</View>
		</>
	)
}

export default PostListItemHeader
