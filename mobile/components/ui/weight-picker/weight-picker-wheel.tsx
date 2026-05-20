import React, { useMemo } from 'react'
import { Dimensions, Platform, Text, View } from 'react-native'
import { cn } from '@/helpers/cn'
import WheelPicker, { withVirtualized } from '@quidone/react-native-wheel-picker'
import Overlay from '@/components/ui/weight-picker/overlay'
import * as Haptics from 'expo-haptics'

interface WeightPickerWheelProps {
	value?: number
	onChange?: (value: number) => void
	onValueChanging?: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const VirtualizedWheelPicker = withVirtualized(WheelPicker)
const WeightPickerWheel = ({ value = 70, onChange }: WeightPickerWheelProps) => {
	const data = useMemo(
		() =>
			Array.from({ length: 186 }, (_, index) => {
				const weight = index + 15

				return {
					value: weight,
					label: `${weight} кг`
				}
			}),
		[]
	)

	return (
		<View className="items-center justify-center overflow-hidden">
			<VirtualizedWheelPicker
				data={data}
				value={value}
				enableScrollByTapOnItem
				initialNumToRender={10}
				windowSize={5}
				itemHeight={60}
				visibleItemCount={9}
				onValueChanging={() => {
					if (Platform.OS === 'ios') Haptics.selectionAsync()
				}}
				renderOverlay={(props) => <Overlay {...props} />}
				onValueChanged={({ item }) => {
					onChange?.(item.value)
				}}
				contentContainerStyle={{
					width: SCREEN_WIDTH / 1.1
				}}
				renderItem={({ item, index }) => (
					<View key={index} className="items-center justify-center h-[60px] w-full">
						<Text
							className={cn('text-[28px]', {
								'text-white font-semibold': value === item.value,
								'text-[#7A7A7A]': value !== item.value
							})}
						>
							{item.label}
						</Text>
					</View>
				)}
			/>
		</View>
	)
}

export default WeightPickerWheel
