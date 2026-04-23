import { SafeAreaView } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import {
	ScrollView,
	View,
	Pressable,
	Platform,
	StyleSheet,
	Dimensions,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import ColorPicker, { ColorFormatsObject, HueSlider, InputWidget, OpacitySlider, Panel1 } from 'reanimated-color-picker'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Button } from '@/components/ui/Button'
import MapComponentColorPick from '@/components/map/MapComponentColorPick'
import { FREE_COLORS } from '@shared/constants'
import Modal from '@/components/ui/Modal/Modal'
import { useRouter } from 'expo-router'
import BlurProvider from '@/components/providers/BlurProvider'

const { height } = Dimensions.get('screen')
const MAP_HEIGHT = height / 3.83

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
	const [notSavedModal, setNotSavedModal] = useState(false)
	const router = useRouter()

	const handleCloseNotSavedModal = () => {
		setNotSavedModal(false)
	}

	const handleOpenNotSavedModal = () => {
		setNotSavedModal(true)
	}

	const exitWithoutSave = () => {
		handleCloseNotSavedModal()
		if (router.canGoBack()) {
			router.back()
		} else {
			router.push('/(settings)')
		}
	}

	const [color, setColor] = useState<string>('rgba(0, 200, 100, 1)') // rgba(0,200,100,0.2)
	const currentColor = useSharedValue('rgba(0, 200, 100, 1)')

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
			setColor(color.rgba)
		}
	}

	// runs on the ui thread on color change
	const onColorChange = (color: ColorFormatsObject) => {
		'worklet'
		currentColor.value = color.rgba
	}

	const isFreeMode = false

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<BlurProvider>
				<Modal
					isOpen={notSavedModal}
					handleClose={handleCloseNotSavedModal}
					label="Выйти без сохранения данных?"
					labelSize={16}
				>
					<View className="gap-[20px]">
						<View className="flex-row gap-[10px]">
							<Button onPress={exitWithoutSave} variant="white" buttonContainerClassName="flex-1">
								Да
							</Button>
							<Button
								onPress={handleCloseNotSavedModal}
								variant="white"
								buttonContainerClassName="flex-1"
							>
								Нет
							</Button>
						</View>
					</View>
				</Modal>
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<ScrollView
							contentInsetAdjustmentBehavior="automatic"
							contentContainerStyle={{ flexGrow: 1 }}
							keyboardShouldPersistTaps="handled"
						>
							<Container className="gap-[20px]">
								<HeaderBack returnCallback={handleOpenNotSavedModal}>
									Выбор{' '}
									<Animated.Text
										className="text-[20px]"
										style={[{ fontFamily: fontFamily.bold }, animatedTextStyle]}
									>
										цвета
									</Animated.Text>
								</HeaderBack>
								<MapComponentColorPick
									minMapHeight={MAP_HEIGHT}
									maxMapHeight={MAP_HEIGHT}
									rounded={25}
									// interactiveDisabled
									activeColor={color}
								/>
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
											{Object.values(FREE_COLORS).map((color) => {
												return (
													<ColorBox
														key={color}
														color={color}
														onPress={(newColor) => onColorPick(newColor)}
													/>
												)
											})}
										</View>
									</ScrollView>
								)}
								<Button variant="white">Сохранить</Button>
							</Container>
						</ScrollView>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</BlurProvider>
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
