import React from 'react'
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
import { useRouter } from 'expo-router'
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'

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
	onToggleSubscribeCallback?: (isSubscribed: boolean, authorId?: string) => void
}

const PostListItemHeader = ({
	subscribeData,
	isMyPost,
	authorName,
	authorId,
	avatar,
	createdAt,
	workoutType,
	onToggleSubscribeCallback
}: IProps) => {
	const router = useRouter()
	const toast = useToast()
	const {
		value: isSubscribed,
		toggle: toggleSubscribe,
		isLoading
	} = useOptimisticToggle({
		initialValue: subscribeData?.isSubscribed,
		onEnable: () => subscribeToUser(subscribeData!.authorId!),
		onDisable: () => unsubscribeFromUser(subscribeData!.authorId!),
		onError: () => toast.error('Ошибка, попробуйте позже'),
		onSuccess: (val) => onToggleSubscribeCallback?.(val, subscribeData!.authorId)
	})

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
							router.push({
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
							onPress={toggleSubscribe}
							disabled={isLoading}
							className={cn('w-[50px] h-[50px] rounded-full items-center justify-center', {
								'bg-white': !isSubscribed,
								'bg-green-main': isSubscribed
							})}
						>
							{!isSubscribed ? <PlusIconSvg /> : <CheckMarkIconSvg />}
						</Pressable>
					</View>
				)}
			</View>
		</>
	)
}

export default PostListItemHeader
