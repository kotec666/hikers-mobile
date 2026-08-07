import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PostMetrics from '@/components/ui/Post/PostMetrics'
import { ITrainingMetrics } from '@/api/workout'
import { formatDistance } from '@/helpers/distance'
import { formatTimeFromSecondsCompact } from '@/helpers/formatTime'
import { useTranslation } from 'react-i18next'

interface IProps {
	title?: string
	description?: string | null
	isDetail?: boolean
	metrics?: ITrainingMetrics
}

const PostListItemBody = (props: IProps) => {
	const { t, i18n } = useTranslation()

	return (
		<>
			<View className="gap-[15px]">
				<View className="gap-[6px]">
					<Text className="text-gray-ab text-[19px]" style={{ fontFamily: fontFamily.bold }}>
						{props.title}
					</Text>
					<Text
						className="text-gray-ab text-base"
						numberOfLines={props.isDetail ? undefined : 2}
						style={{ fontFamily: fontFamily.medium }}
					>
						{props.description}
					</Text>
				</View>

				<View className="flex-row justify-between w-full">
					<PostMetrics
						label={t('measurementUnits.distance')}
						text={formatDistance(props.metrics?.distanceM || 0, i18n.language, {
							meter: t('measurementUnits.meters.short'),
							kilometer: t('measurementUnits.km.short')
						})}
					/>
					<PostMetrics
						label={t('measurementUnits.time')}
						text={formatTimeFromSecondsCompact(
							props.metrics?.timeSec,
							t('measurementUnits.seconds.short'),
							t('measurementUnits.minutes.short'),
							t('measurementUnits.hours.short')
						)}
					/>
					<PostMetrics
						label={t('measurementUnits.climb')}
						text={`${props.metrics?.altitudeGainM || '-'} ${t('measurementUnits.meters.short')}`}
					/>
				</View>
			</View>
		</>
	)
}

export default PostListItemBody
