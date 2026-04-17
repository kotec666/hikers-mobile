import { fontFamily } from '@/constants/Fonts'
import React, { useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Share, Platform, findNodeHandle } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import LikeSvg from '@/components/svg/LikeSvg'
import ShareSvg from '@/components/svg/ShareSvg'
import { Colors } from '@/constants/Colors'
import { IParticipant, likePostById, unlikePostById } from '@/api/posts'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useToast } from '@/hooks/useToast'
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'
import { Motion } from '@legendapp/motion'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'

interface IProps {
	postId?: string
	participants?: IParticipant[]
	likeData?: {
		isLiked: boolean
		postId: string
		likesCount: number
	}
}

const PostListItemBottom = (props: IProps) => {
	const { push } = useSafeNavigation()
	const toast = useToast()
	const shareButtonRef = useRef(null)
	const participantsCount = props?.participants?.length || 0
	const [likesCount, setLikesCount] = useState(props.likeData?.likesCount ?? 0)

	const {
		value: isLiked,
		toggle: toggleLike,
		isLoading: isLoadingLike
	} = useOptimisticToggle({
		initialValue: props.likeData?.isLiked ?? false,
		onEnable: async () => {
			if (!props.likeData?.postId) throw new Error('Не выбран пост')
			await likePostById(props.likeData.postId)
		},
		onDisable: async () => {
			if (!props.likeData?.postId) throw new Error('Не выбран пост')
			await unlikePostById(props.likeData.postId)
		},
		onError: () => toast.error('Ошибка, повторите попытку позже'),
		onSuccess: (val) => {
			setLikesCount((prev) => prev + (val ? 1 : -1))
		}
	})

	const sharePost = async () => {
		const url = `${process.env.EXPO_PUBLIC_API_URL}/posts/${props.postId}`
		const anchor = findNodeHandle(shareButtonRef.current) ?? undefined

		try {
			await Share.share(
				{
					...(Platform.OS === 'android' ? { message: url } : { url })
				},
				{
					dialogTitle: 'Поделиться',
					excludedActivityTypes: [
						'com.apple.UIKit.activity.Print',
						'com.apple.UIKit.activity.AssignToContact'
					],
					anchor
				}
			)
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<View className="flex-row justify-between items-center">
			<TouchableOpacity
				onPress={() =>
					push({
						pathname: '/posts/members/[id]',
						params: { id: props.postId! }
					})
				}
			>
				<View className="flex-row items-center gap-[15px]">
					<View className="flex-row">
						{Boolean(props?.participants?.length)
							? props.participants?.slice(-3)?.map((p, index) => (
									<View
										key={p.id}
										style={{
											marginLeft: index === 0 ? 0 : -10,
											//zIndex: props?.participants?.length || 1 - index,
											zIndex: 3 - index,
											shadowColor: Colors['gray-ab'],
											shadowOffset: {
												width: 0,
												height: 1
											},
											shadowOpacity: 0.2,
											shadowRadius: 1.5,
											elevation: 2
										}}
										className="rounded-full shadow-sm"
									>
										<UserAvatar
											avatar={
												p.user.avatarFilename
													? `${PATH_TO_IMAGE}${p.user.avatarFilename}`
													: null
											}
											style={{ width: 35, height: 35 }}
											bordered
										/>
									</View>
								))
							: null}
					</View>

					<View className="flex-row gap-[5px]">
						<Text className="text-blue-3d text-sm" style={{ fontFamily: fontFamily.medium }}>
							{props.participants?.[0].user.name}
						</Text>
						{participantsCount > 1 && (
							<>
								<Text className="text-gray-ab text-sm" style={{ fontFamily: fontFamily.medium }}>
									и ещё
								</Text>
								<Text
									className="text-blue-3d text-sm"
									style={{ fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] }}
								>
									{participantsCount - 1}
								</Text>
							</>
						)}
					</View>
				</View>
			</TouchableOpacity>

			<View className="flex-row gap-[15px]">
				<View className="flex-row gap-[8px] items-center">
					<Motion.Pressable onPress={toggleLike} disabled={isLoadingLike}>
						<Motion.View
							whileTap={{ scale: 0.8 }}
							transition={{
								type: 'spring',
								damping: 20,
								stiffness: 400
							}}
						>
							<LikeSvg isPressed={isLiked} />
						</Motion.View>
					</Motion.Pressable>
					<Text
						className="text-white text-sm"
						style={{ fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] }}
					>
						{likesCount}
					</Text>
				</View>
				<Motion.Pressable onPress={sharePost}>
					<View ref={shareButtonRef}>
						<Motion.View
							className="items-center justify-center"
							whileTap={{ scale: 0.8 }}
							transition={{
								type: 'spring',
								damping: 20,
								stiffness: 400
							}}
						>
							<ShareSvg />
						</Motion.View>
					</View>
				</Motion.Pressable>
			</View>
		</View>
	)
}

export default PostListItemBottom
