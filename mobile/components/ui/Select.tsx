import { cn } from '@/helpers/cn'
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { Container } from '@/components/ui/Container'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import { FlatList } from 'react-native-gesture-handler'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import { BlurView } from 'expo-blur'
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

export interface SelectOption {
	value: string
	label: string
	IconComponent?: React.FC<{ width?: number; height?: number }>
}

export interface SelectProps {
	containerClassName?: string
	className?: string
	options: SelectOption[]
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	error?: string
	disabled?: boolean
}

const { height } = Dimensions.get('screen')

export function Select(props: SelectProps) {
	const { className, options, value, onChange, placeholder, error, disabled, containerClassName } = props
	const [isOpen, setIsOpen] = useState(false)
	const [showDropdown, setShowDropdown] = useState(false)

	const selectedOption = options.find((option) => option.value === value)
	const displayValue = selectedOption?.label || placeholder

	const handleSelect = (optionValue: string) => {
		onChange?.(optionValue)
		toggleOpen()
	}

	const animatedHeight = useSharedValue(0)

	const maxHeight = Math.min(height / 2, options.length * 70)

	const animatedStyle = useAnimatedStyle(() => ({
		height: withTiming(animatedHeight.value, {
			duration: 300,
			easing: Easing.out(Easing.quad)
		}),
		opacity: withTiming(animatedHeight.value > 0 ? 1 : 0, {
			duration: 200
		})
	}))

	const toggleOpen = () => {
		if (!isOpen) {
			setShowDropdown(true)
			animatedHeight.value = maxHeight
			setIsOpen(true)
		} else {
			animatedHeight.value = 0
			setIsOpen(false)
			setTimeout(() => setShowDropdown(false), 300)
		}
	}

	return (
		<View className={cn(' relative', containerClassName)}>
			<TouchableOpacity
				style={[
					styles.select,
					error
						? { borderColor: Colors['red-8b'], backgroundColor: Colors['red-55'] }
						: { borderColor: Colors['black-44'], backgroundColor: 'transparent' },
					disabled && { opacity: 0.6 }
				]}
				className={cn(
					'h-[50px] border-[1px] rounded-full relative flex-row items-center justify-between px-4',
					{
						'text-red-ff bg-red-55': error,
						'text-white bg-black-25': !error && !disabled,
						'opacity-60': disabled
					},
					className
				)}
				onPress={() => !disabled && toggleOpen()}
				disabled={disabled}
			>
				<Text
					style={[styles.text, { color: value !== undefined ? 'white' : Colors['black-5c'] }]}
					numberOfLines={1}
				>
					{displayValue}
				</Text>
				<ArrowDownSvg />
			</TouchableOpacity>

			<Animated.View
				className="absolute border-[1px] border-white/20 rounded-[25px] left-0 gap-[15px] w-full overflow-hidden"
				style={[
					{ top: 60, zIndex: 2, backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'black' },
					animatedStyle
				]}
			>
				{showDropdown &&
					(Platform.OS === 'ios' ? (
						<BlurView
							tint="dark"
							intensity={10}
							style={{ overflow: 'hidden', backgroundColor: 'transparent', flex: 1 }}
						>
							<SelectContainer
								options={options}
								handleSelect={handleSelect}
								value={value}
								handleClose={() => toggleOpen()}
							/>
						</BlurView>
					) : (
						<SelectContainer
							options={options}
							handleSelect={handleSelect}
							value={value}
							handleClose={() => toggleOpen()}
						/>
					))}
			</Animated.View>

			{error && (
				<Container className="mt-[10px]">
					<Text className="text-white text-sm" style={{ fontFamily: fontFamily.regular }}>
						{error}
					</Text>
				</Container>
			)}
		</View>
	)
}

const SelectContainer = ({
	options,
	handleSelect,
	value,
	handleClose
}: {
	options: SelectOption[]
	handleSelect: (optionValue: string) => void
	value: string | undefined
	handleClose: () => void
}) => {
	return (
		<>
			<FlatList
				data={options}
				keyExtractor={(item) => item.value}
				renderItem={({ item }) => {
					const Icon = item.IconComponent ?? PeopleRunningSvg

					return (
						<TouchableOpacity
							style={[styles.option, item.value === value && styles.selectedOption]}
							onPress={() => handleSelect(item.value)}
						>
							<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">
								<Icon width={26} height={26} />
							</View>
							<Text style={styles.optionText}>{item.label}</Text>
						</TouchableOpacity>
					)
				}}
				showsVerticalScrollIndicator={false}
			/>
			<TouchableOpacity onPress={handleClose}>
				<View
					className="w-full border-[1px] border-white/20 rounded-[25px] h-[50px] items-center justify-center"
					style={{ transform: [{ rotate: '180deg' }] }}
				>
					<ArrowDownSvg />
				</View>
			</TouchableOpacity>
		</>
	)
}

const styles = StyleSheet.create({
	select: {
		position: 'relative',
		fontFamily: fontFamily.regular,
		fontSize: 14
	},
	text: {
		fontFamily: fontFamily.regular,
		fontSize: 14,
		flex: 1,
		marginRight: 8
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		padding: 12,
		borderRadius: 8,
		marginVertical: 2
	},
	selectedOption: {
		backgroundColor: Colors['black-44']
	},
	optionText: {
		fontFamily: fontFamily.regular,
		fontSize: 14,
		color: 'white'
	}
})
