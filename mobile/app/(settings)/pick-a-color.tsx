import { SafeAreaView } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Pressable, Platform, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import ColorPicker, { ColorFormatsObject, HueSlider, InputWidget, OpacitySlider, Panel1 } from 'reanimated-color-picker'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const Divider = () => {
	return <View style={{ height: 1, backgroundColor: Colors['gray-3a'] }} />
}

const ColorBox = ({ color, onPress }: { color: string; onPress?: (color: string) => void }) => {
	return (
		<Pressable
			onPress={() => onPress?.(color)}
			className="w-[40px] h-[40px] border-2 border-white rounded-[4px]"
			style={{ backgroundColor: color }}
		/>
	)
}

const SettingsPickAColorPage = () => {
	const [color, setColor] = useState<string>(Colors['green-main'])
	const currentColor = useSharedValue(Colors['green-main'])

	const animatedTextStyle = useAnimatedStyle(() => {
		return {
			color: currentColor.value
		}
	})

	// runs on the js thread on color pick
	const onColorPick = (color: string | ColorFormatsObject) => {
		if (typeof color === 'string') {
			currentColor.value = color
			setColor(color)
		} else {
			setColor(color.hex)
		}
	}

	// runs on the ui thread on color change
	const onColorChange = (color: ColorFormatsObject) => {
		'worklet'
		currentColor.value = color.hex
	}

	const isFreeMode = false

	return (
		<SafeAreaView>
			<Container className="gap-[20px]">
				<HeaderBack>
					Выбор{' '}
					<Animated.Text className="text-[20px]" style={[{ fontFamily: fontFamily.bold }, animatedTextStyle]}>
						цвета
					</Animated.Text>
				</HeaderBack>

				{isFreeMode ? (
					<View style={colorPickerStyle.pickerContainer}>
						<ColorPicker
							value={color}
							sliderThickness={25}
							thumbSize={24}
							thumbShape="circle"
							onChange={onColorChange}
							onCompleteJS={onColorPick}
							style={colorPickerStyle.picker}
							boundedThumb
						>
							<Panel1 style={colorPickerStyle.panelStyle} />
							<HueSlider style={colorPickerStyle.sliderStyle} />
							<OpacitySlider style={colorPickerStyle.sliderStyle} />
							<Divider />
							<InputWidget
								inputStyle={colorPickerStyle.inputStyle}
								iconColor="#fff"
								inputTitleStyle={colorPickerStyle.inputTitleStyle}
							/>
						</ColorPicker>
					</View>
				) : (
					<ScrollView
					//contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
					>
						<View className="flex-row flex-wrap gap-[16px]">
							{Object.values(Colors).map((color) => {
								return (
									<ColorBox key={color} color={color} onPress={(newColor) => onColorPick(newColor)} />
								)
							})}
						</View>
					</ScrollView>
				)}
			</Container>
			<StatusBar style="light" />
		</SafeAreaView>
	)
}

export default SettingsPickAColorPage

const shadow = Platform.select({
	web: { boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 2px' },
	default: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.2,
		shadowRadius: 1.41,

		elevation: 2
	}
})

export const colorPickerStyle = StyleSheet.create({
	picker: {
		gap: 20
	},
	pickerContainer: {
		alignSelf: 'center',
		width: '100%',
		backgroundColor: '#1A1A1A',
		padding: 20,
		borderRadius: 20,
		...shadow
	},
	panelStyle: {
		borderRadius: 16,
		...shadow
	},
	sliderStyle: {
		borderRadius: 20,
		...shadow
	},
	inputStyle: {
		color: '#fff',
		paddingVertical: 2,
		borderColor: 'rgb(255 255 255 / 0.5)',
		fontSize: 12,
		marginLeft: 5
	},
	inputTitleStyle: {
		color: 'rgb(255 255 255 / 0.5)'
	}
})
