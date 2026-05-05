import React, { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import PlusIconSvg from '@/components/svg/PlusIconSvg'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { TrainingType } from '@/shared/enums'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToggleSubscribeMutation } from '@/queries/subscriptions'

interface IProps {
	isMyPost?: boolean
	authorId?: string
	authorName?: string | null
	avatar?: string | null
	createdAt?: string | null
	workoutType?: TrainingType
	subscribeData?: {
		authorId?: string
		isSubscribed?: boolean
	}
}

const PostListItemHeader = ({
	subscribeData,
	isMyPost,
	authorName,
	authorId,
	avatar,
	createdAt,
	workoutType
}: IProps) => {
	const { push } = useSafeNavigation()
	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

	const handleSubscribe = useCallback(
		async (userId?: string, isSubscribed?: boolean) => {
			if (!userId) return
			if (typeof isSubscribed === 'undefined') return

			await toggleSubscribe({
				userId,
				isSubscribed
			})
		},
		[toggleSubscribe]
	)

	const renderIcon = (workoutType?: TrainingType) => {
		if (!workoutType) return
		const found = WorkoutTypesData.find((w) => w.type === workoutType)
		if (found) {
			return <found.IconComponent color="black" width={16} height={16} />
		}
	}

	return (
		<>
			<View className="flex-row justify-between w-full">
				<Pressable
					onPress={() => {
						if (!isMyPost) {
							push({
								pathname: '/user/profile/[id]',
								params: { id: `${authorId}` }
							})
						}
					}}
					className="flex-row gap-[16px] items-center"
				>
					<UserAvatar bordered avatar={avatar ? `${PATH_TO_IMAGE}${avatar}` : null} />
					<View className="gap-[5px]">
						<Text className="text-white text-[17px]" style={{ fontFamily: fontFamily.bold }}>
							{authorName}
						</Text>
						<View className="flex-row items-center gap-[8px]">
							<View className="w-[25px] h-[25px] bg-white rounded-[8px] items-center justify-center">
								{renderIcon(workoutType)}
							</View>
							<View>
								<Text className="text-[13px] text-gray-ab" style={{ fontFamily: fontFamily.regular }}>
									{formatRelativeDate(createdAt)}
								</Text>
							</View>
						</View>
					</View>
				</Pressable>
				{!isMyPost && (
					<View>
						<Pressable
							onPress={async () =>
								await handleSubscribe(subscribeData?.authorId, subscribeData?.isSubscribed)
							}
							disabled={isPendingSubscribe}
							className={cn('w-[50px] h-[50px] rounded-full items-center justify-center', {
								'bg-white': !subscribeData?.isSubscribed,
								'bg-green-main': subscribeData?.isSubscribed
							})}
						>
							{!subscribeData?.isSubscribed ? (
								<PlusIconSvg />
							) : (
								<CheckMarkIconSvg width={25} height={25} />
							)}
						</Pressable>
					</View>
				)}
			</View>
		</>
	)
}

export default PostListItemHeader
