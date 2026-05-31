import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Pressable, Platform, StyleSheet, Dimensions } from 'react-native'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { fontFamily } from '@/constants/Fonts'
import ColorPicker, { ColorFormatsObject, HueSlider, InputWidget, Panel1 } from 'reanimated-color-picker'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Button } from '@/components/ui/Button'
import { FREE_COLORS } from '@shared/constants'
import Modal from '@/components/ui/Modal/Modal'
import { useRouter } from 'expo-router'
import BlurProvider from '@/components/providers/BlurProvider'
import { Page } from '@/components/ui/Page'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import MapComponentColorPick from '@/components/map/MapComponentColorPick'

const { height } = Dimensions.get('screen')
const { width } = Dimensions.get('window')

const GAP = 16
const COLUMNS = 7
const CONTAINER_PADDING = 16
const MAP_HEIGHT = height / 3.2

const Divider = () => {
	return <View style={{ height: 1, backgroundColor: Colors['gray-3a'] }} />
}

const ColorBox = ({ color, size, onPress }: { color: string; size: number; onPress?: (color: string) => void }) => {
	return (
		<Pressable
			onPress={() => onPress?.(color)}
			className="w-[40px] h-[40px] border-2 border-white rounded-[4px]"
			style={{ backgroundColor: color, width: size, height: size }}
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

	const [color, setColor] = useState<string>('rgb(0, 200, 100)') // rgb(0,200,100) // alpha ,0.2
	const currentColor = useSharedValue('rgb(0, 200, 100)')

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
			setColor(color.rgb)
		}
	}

	// runs on the ui thread on color change
	const onColorChange = (color: ColorFormatsObject) => {
		'worklet'
		currentColor.value = color.rgb
	}

	const colorBoxSize = (width - CONTAINER_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS

	const isFreeMode = false

	return (
		<Page>
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
				<KeyboardAwareScrollView
					contentInsetAdjustmentBehavior="automatic"
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
					bottomOffset={50}
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
							rounded={25}
							activeColor={color}
							// interactiveDisabled
							maxContainerHeight={MAP_HEIGHT}
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
									<Divider />
									<InputWidget
										iconColor="#fff"
										disableAlphaChannel
										inputStyle={colorPickerStyle.inputStyle}
										inputTitleStyle={colorPickerStyle.inputTitleStyle}
									/>
								</ColorPicker>
							</View>
						) : (
							<ScrollView>
								<View className="flex-row flex-wrap" style={{ gap: GAP }}>
									{Object.values(FREE_COLORS).map((color) => {
										return (
											<ColorBox
												key={color}
												color={color}
												size={colorBoxSize}
												onPress={(newColor) => onColorPick(newColor)}
											/>
										)
									})}
								</View>
							</ScrollView>
						)}
						<Button variant="white">Сохранить</Button>
					</Container>
				</KeyboardAwareScrollView>
			</BlurProvider>
		</Page>
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
		borderColor: 'rgba(255 255 255 / 0.5)',
		fontSize: 12,
		marginLeft: 5
	},
	inputTitleStyle: {
		color: 'rgba(255 255 255 / 0.5)'
	}
})
