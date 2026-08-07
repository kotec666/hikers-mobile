import React from 'react'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { View, Text } from 'react-native'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useTranslation } from 'react-i18next'

const TrainingsEmpty = (props: { text?: string }) => {
	const { t } = useTranslation()
	const { push } = useSafeNavigation()

	return (
		<View className="gap-[40px] flex-1 justify-center items-center">
			<Text className="text-gray-ab text-center text-[19px]" style={{ fontFamily: fontFamily.regular }}>
				{props.text}
			</Text>
			<Button onPress={() => push('/(tabs)/newTraining')} variant="white">
				{t('TrainingsEmpty.action.startTraining')}
			</Button>
		</View>
	)
}

export default TrainingsEmpty
