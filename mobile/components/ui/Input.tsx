import { cn } from '@/helpers/cn'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import { ReactNode } from 'react'
import SearchSvg from '@/components/svg/SearchSvg'

export interface Props extends TextInputProps {
	className?: string
	svg?: ReactNode
	error?: boolean
	isFind?: boolean
}

export function Input(props: Props) {
	const { className, svg, error, isFind, ...restProps } = props

	return (
		<View className="grow">
			<TextInput
				style={styles.input}
				className={cn('', className)}
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
		</View>
	)
}

const styles = StyleSheet.create({
	input: {
		position: 'relative',
		height: 50,
		color: 'white',
		fontFamily: fontFamily.regular,
		borderWidth: 2,
		borderRadius: 999,
		borderColor: Colors['black-44'],
		backgroundColor: 'transparent',
		paddingLeft: 15,
		paddingRight: 42,
		fontSize: 14,
		textDecorationColor: 'white'
	}
})
