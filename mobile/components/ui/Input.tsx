import { cn } from '@/helpers/cn'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import React, { forwardRef, ReactNode } from 'react'
import SearchSvg from '@/components/svg/SearchSvg'
import ErrorMessage from '@/components/ErrorMessage'

export interface Props extends TextInputProps {
	containerClassName?: string
	svg?: ReactNode
	error?: string | boolean
	isFind?: boolean
}

export const Input = forwardRef<TextInput, Props>(function Input(props, ref) {
	const { className, svg, error, isFind, containerClassName, ...restProps } = props

	return (
		<View className={cn('', containerClassName)}>
			<TextInput
				ref={ref}
				style={[
					styles.input,
					{
						borderWidth: 1,
						position: 'relative',
						paddingLeft: 16,
						paddingRight: isFind ? 42 : 16,
						borderColor: error ? Colors['red-8b'] : Colors['black-44'],
						backgroundColor: error ? Colors['red-55'] : 'transparent',
						color: error ? Colors['red-ff'] : 'white',
						height: restProps.multiline ? 200 : 50,
						borderRadius: restProps.multiline ? 8 : 999
					},
					restProps.multiline ? { paddingVertical: 16, textAlignVertical: 'top' } : {}
				]}
				selectionColor={Colors['yellow-main']}
				placeholderTextColor={Colors['black-5c']}
				{...restProps}
			/>
			{isFind && (
				<View className="absolute top-[50%] right-[15px] -translate-y-[50%]">
					<View className="w-[19px] h-[19px] items-center justify-center">
						<SearchSvg />
					</View>
				</View>
			)}
			{!isFind && <ErrorMessage error={error} />}
		</View>
	)
})

const styles = StyleSheet.create({
	input: {
		position: 'relative',
		fontFamily: fontFamily.regular,
		fontSize: 14,
		textDecorationColor: 'white'
	}
})
