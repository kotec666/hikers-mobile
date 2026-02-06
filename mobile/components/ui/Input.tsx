import { cn } from '@/helpers/cn'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import React, { ReactNode } from 'react'
import SearchSvg from '@/components/svg/SearchSvg'
import ErrorMessage from '@/components/ErrorMessage'

export interface Props extends TextInputProps {
	containerClassName?: string
	className?: string
	svg?: ReactNode
	error?: string | boolean
	isFind?: boolean
}

export function Input(props: Props) {
	const { className, svg, error, isFind, ...restProps } = props

	return (
		<View className={cn('', props.containerClassName)}>
			<TextInput
				style={[
					styles.input,
					error
						? { borderColor: Colors['red-8b'], color: Colors['red-ff'], backgroundColor: Colors['red-55'] }
						: { borderColor: Colors['black-44'], color: 'white', backgroundColor: 'transparent' },
					isFind ? { paddingRight: 42 } : { paddingRight: 15 },
					restProps.multiline ? { height: 100 } : {}
				]}
				className={cn(
					'border-[1px] relative placeholder:text-gray-ab placeholder:text-[15px]',
					{
						'text-red-ff bg-red-55': error,
						'text-white bg-black-25': !error,
						'h-[50px] rounded-full': !restProps.multiline,
						'rounded-[4px]': restProps.multiline
					},
					className
				)}
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
			<ErrorMessage error={error} />
		</View>
	)
}

const styles = StyleSheet.create({
	input: {
		position: 'relative',
		fontFamily: fontFamily.regular,
		paddingLeft: 15,
		fontSize: 14,
		textDecorationColor: 'white'
	}
})
