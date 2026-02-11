import { fontFamily } from '@/constants/Fonts'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import LikeSvg from '@/components/svg/LikeSvg'
import ShareSvg from '@/components/svg/ShareSvg'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { IParticipant, likePostById, unlikePostById } from '@/api/posts'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useToast } from '@/hooks/useToast'

interface IProps {
	authorName?: string
	participants?: IParticipant[]
	likeData?: {
		isLiked: boolean
		postId: string
		likesCount: number
	}
}

const PostListItemBottom = (props: IProps) => {
	const router = useRouter()
	const toast = useToast()
	const participantsCount = props?.participants?.length || 0

	const [isLikedState, setIsLikedState] = useState({
		count: props.likeData?.likesCount || 0,
		isLiked: props.likeData?.isLiked
	})

	const handleClickLike = async () => {
		try {
			if (!props.likeData?.postId) {
				return toast.info('Не выбран пост для лайка')
			}

			await likePostById(props.likeData.postId)
			setIsLikedState((s) => ({ ...s, isLiked: true, count: s.count + 1 }))
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleClickUnlike = async () => {
		try {
			if (!props.likeData?.postId) {
				return toast.info('Не выбран пост для удаления лайка')
			}

			await unlikePostById(props.likeData.postId)
			setIsLikedState((s) => ({ ...s, isLiked: false, count: s.count - 1 }))
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleClickLikeUnlike = async () => {
		if (isLikedState.isLiked) {
			return await handleClickUnlike()
		} else {
			return await handleClickLike()
		}
	}
	return (
		<View className="flex-row justify-between items-center">
			<TouchableOpacity onPress={() => router.push('/news-feed/members')}>
				<View className="flex-row items-center gap-[15px]">
					<View className="flex-row">
						{Boolean(props?.participants?.length)
							? props.participants?.slice(0, 3)?.map((p, index) => (
									<View
										key={p.id}
										style={{
											marginLeft: index === 0 ? 0 : -10,
											zIndex: props?.participants?.length || 1 - index,
											shadowColor: Colors['green-main'],
											shadowOffset: {
												width: 0,
												height: 1
											},
											shadowOpacity: 0.2,
											shadowRadius: 1.5,
											elevation: 2
										}}
										className="bg-white rounded-full shadow-sm"
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
							{props.authorName}
						</Text>
						{participantsCount > 1 && (
							<>
								<Text className="text-gray-ab text-sm" style={{ fontFamily: fontFamily.medium }}>
									и ещё
								</Text>
								<Text className="text-blue-3d text-sm" style={{ fontFamily: fontFamily.medium }}>
									{participantsCount - 1}
								</Text>
							</>
						)}
					</View>
				</View>
			</TouchableOpacity>

			<View className="flex-row gap-[15px]">
				<View className="flex-row gap-[8px] items-center">
					<Pressable onPress={handleClickLikeUnlike}>
						<LikeSvg isPressed={isLikedState.isLiked} />
					</Pressable>
					<Text
						className="text-white text-sm"
						style={{ fontFamily: fontFamily.medium, fontVariant: ['tabular-nums'] }}
					>
						{isLikedState.count}
					</Text>
				</View>
				<View className="items-center justify-center">
					<ShareSvg />
				</View>
			</View>
		</View>
	)
}

export default PostListItemBottom
