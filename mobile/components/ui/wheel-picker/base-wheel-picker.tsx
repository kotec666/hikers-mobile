import React from 'react'
import { Dimensions, Platform, View } from 'react-native'
import WheelPicker, { withVirtualized, RenderItem } from '@quidone/react-native-wheel-picker'
import * as Haptics from 'expo-haptics'
import WheelPickerOverlay from './wheel-picker-overlay'

const { width: SCREEN_WIDTH } = Dimensions.get('screen')

const VirtualizedWheelPicker = withVirtualized(WheelPicker)

export interface BaseWheelPickerItem<T> {
	value: T
	label: string
	[key: string]: any
}

interface BaseWheelPickerProps<T> {
	data: BaseWheelPickerItem<T>[]
	value: T
	onChange?: (value: T) => void
	itemHeight?: number
	visibleItemCount?: number
	overlayHeightMultiplier?: number
	renderItem: RenderItem<BaseWheelPickerItem<T>>
}

const BaseWheelPicker = <T,>({
	data,
	value,
	onChange,
	itemHeight = 60,
	visibleItemCount = 9,
	overlayHeightMultiplier = 1,
	renderItem
}: BaseWheelPickerProps<T>) => {
	return (
		<View className="items-center justify-center overflow-hidden px-4">
			<VirtualizedWheelPicker
				data={data}
				value={value}
				enableScrollByTapOnItem
				initialNumToRender={10}
				windowSize={5}
				itemHeight={itemHeight}
				visibleItemCount={visibleItemCount}
				onValueChanging={() => {
					if (Platform.OS === 'ios') {
						Haptics.selectionAsync()
					}
				}}
				renderOverlay={(props) => <WheelPickerOverlay {...props} heightMultiplier={overlayHeightMultiplier} />}
				onValueChanged={({ item }) => {
					onChange?.(item.value)
				}}
				contentContainerStyle={{
					width: SCREEN_WIDTH / 1.1
				}}
				renderItem={renderItem}
			/>
		</View>
	)
}

export default BaseWheelPicker
