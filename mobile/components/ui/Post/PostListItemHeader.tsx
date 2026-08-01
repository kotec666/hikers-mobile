import React, { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { ReportType, TrainingType } from '@/shared/enums'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToggleSubscribeMutation } from '@/queries/subscriptions'
import MoreOptionsSvg from '@/components/svg/MoreOptionsSvg'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import PopupMenu from '@/components/ui/Popup/PopupMenu'
import { useCreateReportMutation } from '@/queries/reports'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import FinishedFlagSvg from '@/components/svg/FinishedFlagSvg'
import { Colors } from '@/constants/Colors'

interface IProps {
	postId?: string
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
	postId,
	avatar,
	createdAt,
	workoutType
}: IProps) => {
	const { push } = useSafeNavigation()
	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()
	const { mutateAsync: createReportMutation, isPending: isPendingCreateReport } = useCreateReportMutation()

	const handleSubmitReport = async () => {
		if (!postId) return
		try {
			const formData = new FormData()
			formData.append('type', ReportType.TO_POST)
			formData.append('relEntityId', postId)
			await createReportMutation(formData)
		} catch (e: unknown) {
			await getFieldsErrors(e)
		}
	}

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
					className="flex-row gap-[16px] items-center flex-1"
				>
					<UserAvatar bordered avatar={avatar ? `${PATH_TO_IMAGE}${avatar}` : null} />
					<View className="gap-[5px] flex-1 shrink">
						<Text
							className="text-white text-[17px] flex-shrink"
							numberOfLines={1}
							style={{ fontFamily: fontFamily.bold }}
						>
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
					<View className="flex-row items-center gap-5 justify-between">
						<Pressable
							className="flex-row border items-center border-white rounded-[4px] h-[24px] px-[6px]"
							onPress={async () =>
								await handleSubscribe(subscribeData?.authorId, subscribeData?.isSubscribed)
							}
							disabled={isPendingSubscribe}
						>
							<Text className="text-white text-xs" style={{ fontFamily: fontFamily.bold }}>
								{!subscribeData?.isSubscribed ? 'Подписаться' : 'Вы подписаны'}
							</Text>
						</Pressable>
						<PopupMenu
							blurDisabled
							menuWidth={180}
							menuHeight={180}
							trigger={({ open }) => (
								<Pressable onPress={open} hitSlop={20}>
									<MoreOptionsSvg />
								</Pressable>
							)}
						>
							<PopupMenuItem onPress={handleSubmitReport} disabled={isPendingCreateReport}>
								<View className="flex-row items-center gap-3">
									<FinishedFlagSvg size={16} color={Colors['red-ff4']} />
									<Text className="text-base" style={{ color: Colors['red-ff4'] }}>
										Пожаловаться
									</Text>
								</View>
							</PopupMenuItem>
						</PopupMenu>
					</View>
				)}
			</View>
		</>
	)
}

export default PostListItemHeader
