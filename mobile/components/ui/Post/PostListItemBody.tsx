import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PostMetrics from '@/components/ui/Post/PostMetrics'
import { ITrainingMetrics } from '@/api/workout'
import { formatDistance } from '@/helpers/distance'
import { formatTimeFromSecondsCompact } from '@/helpers/formatTime'

interface IProps {
	title?: string
	description?: string | null
	metrics?: ITrainingMetrics
}

const PostListItemBody = (props: IProps) => {
	return (
		<>
			<View className="gap-[15px]">
				<View className="gap-[6px]">
					<Text className="text-gray-ab text-[19px]" style={{ fontFamily: fontFamily.bold }}>
						{props.title}
					</Text>
					<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
						{props.description}
					</Text>
				</View>

				<View className="flex-row justify-between w-full">
					<PostMetrics label="Расстояние" text={formatDistance(props.metrics?.distanceM || 0)} />
					<PostMetrics label="Время" text={formatTimeFromSecondsCompact(props.metrics?.timeSec)} />
					<PostMetrics label="Набор высоты" text={`${props.metrics?.altitudeGainM || '-'} м`} />
				</View>
			</View>
		</>
	)
}

export default PostListItemBody
