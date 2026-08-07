import { fontFamily } from '@/constants/Fonts'
import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, Share, Platform, findNodeHandle } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import LikeSvg from '@/components/svg/LikeSvg'
import ShareSvg from '@/components/svg/ShareSvg'
import { Colors } from '@/constants/Colors'
import { IParticipant } from '@/api/posts'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useToast } from '@/hooks/useToast'
import { Motion } from '@legendapp/motion'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToggleLikePostMutation } from '@/queries/posts'
import { api } from '@/constants/Variables'
import { useTranslation } from 'react-i18next'

interface IProps {
	postId?: string
	participants?: IParticipant[]
	isLiked: boolean
	likesCount: number
}

const PostListItemBottom = (props: IProps) => {
	const { t } = useTranslation()
	const { push } = useSafeNavigation()
	const toast = useToast()
	const shareButtonRef = useRef(null)
	const participantsCount = props?.participants?.length || 0

	const { mutate: toggleLike, isPending } = useToggleLikePostMutation()

	const handleLikePress = () => {
		if (!props.postId) {
			toast.error(t('ToastMessage.error.noPostId'))
			return
		}

		toggleLike({
			postId: props.postId,
			isLiked: props.isLiked
		})
	}

	const sharePost = async () => {
		const url = `${api}/posts/${props.postId}`
		const anchor = findNodeHandle(shareButtonRef.current) ?? undefined

		try {
			await Share.share(
				{
					...(Platform.OS === 'android' ? { message: url } : { url })
				},
				{
					dialogTitle: t('common.share'),
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
						{participantsCount > 1
							? props.participants?.slice(-3)?.map((p, index) => (
									<View
										key={p.id}
										style={{
											marginLeft: index === 0 ? 0 : -10,
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
						{participantsCount > 1 && (
							<>
								<Text className="text-blue-3d text-sm" style={{ fontFamily: fontFamily.medium }}>
									{props.participants?.[0].user.name}
								</Text>
								<Text className="text-gray-ab text-sm" style={{ fontFamily: fontFamily.medium }}>
									{t('Post.participants.and')}
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
					<Motion.Pressable onPress={handleLikePress} disabled={isPending}>
						<Motion.View
							whileTap={{ scale: 0.8 }}
							transition={{
								type: 'spring',
								damping: 20,
								stiffness: 400
							}}
						>
							<LikeSvg isPressed={props.isLiked} />
						</Motion.View>
					</Motion.Pressable>
					<Text
						className="text-white text-sm"
						style={{ fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] }}
					>
						{props.likesCount || 0}
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
