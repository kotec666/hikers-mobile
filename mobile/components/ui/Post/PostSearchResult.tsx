import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Link } from 'expo-router'
import { IFoundPost } from '@/api/search'
import { TrainingType } from '@/shared/enums'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'
import { LngShort, locales } from '@/store/languageStorage'
import { useTranslation } from 'react-i18next'

const PostSearchResult = (props: IFoundPost) => {
	const { i18n } = useTranslation()
	const currentLocale = locales[i18n.language as LngShort] ?? locales[LngShort.en]

	const renderIcon = (workoutType?: TrainingType) => {
		if (!workoutType) return
		const found = WorkoutTypesData.find((w) => w.type === workoutType)
		if (found) {
			return <found.IconComponent color="black" width={26} height={26} />
		}
	}

	return (
		<Link
			href={{
				pathname: '/posts/[id]',
				params: { id: props.id }
			}}
		>
			<View className="flex-row items-center w-full">
				<View className="flex-row items-center gap-[15px] flex-1 min-w-0">
					<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">
						{renderIcon(props.training.type)}
					</View>

					<Text
						numberOfLines={1}
						ellipsizeMode="tail"
						className="text-base text-gray-ab flex-1"
						style={{ fontFamily: fontFamily.medium }}
					>
						{props.title}
					</Text>
				</View>

				<Text className="text-xs text-gray-ab ml-8 shrink-0" style={{ fontFamily: fontFamily.regular }}>
					{formatRelativeDate(props.createdAt, currentLocale)}
				</Text>
			</View>
		</Link>
	)
}

export default PostSearchResult
