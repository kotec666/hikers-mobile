import { cn } from '@/helpers/cn'
import { Pressable, TextInput, TextInputProps, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import React, { forwardRef, ReactNode, useState } from 'react'
import EyeSvg from '@/components/svg/EyeSvg'
import ErrorMessage from '@/components/ErrorMessage'

export interface InputProps extends TextInputProps {
	className?: string
	svg?: ReactNode
	error?: string | boolean
	isPassword?: boolean
}

export const InputIcon = forwardRef<TextInput, InputProps>((props, ref) => {
	const { className, svg, error, isPassword, ...restProps } = props
	const [data, setData] = useState({
		isPasswordVisible: false
	})

	return (
		<View>
			<View>
				<TextInput
					ref={ref}
					style={{
						fontFamily: fontFamily.regular,
						paddingRight: isPassword ? 48 : 15
					}}
					className={cn(
						'h-[50px] border-[1px] pl-[55px] rounded-full relative placeholder:text-gray-ab placeholder:text-[15px]',
						{
							'text-red-ff bg-red-55': error,
							'text-white bg-black-25': !error
						},
						className
					)}
					autoCorrect={isPassword ? false : undefined}
					selectionColor={Colors['yellow-main']}
					secureTextEntry={isPassword && !data.isPasswordVisible}
					{...restProps}
				/>
				{svg && (
					<View className="absolute top-[50%] left-[5px] -translate-y-[50%]">
						<View
							className={cn('w-[40px] h-[40px] rounded-[40px] items-center justify-center', {
								'bg-red-8b': error,
								'bg-black-44': !error
							})}
						>
							{svg}
						</View>
					</View>
				)}
				{isPassword && (
					<View className="absolute top-[50%] right-[15px] -translate-y-[50%]">
						<Pressable
							onPress={() => setData((s) => ({ ...s, isPasswordVisible: !s.isPasswordVisible }))}
							className="w-[28px] h-[28px] items-center justify-center"
						>
							<EyeSvg opened={data.isPasswordVisible} />
						</Pressable>
					</View>
				)}
			</View>
			<ErrorMessage error={error} />
		</View>
	)
})
