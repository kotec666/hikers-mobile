import React, { useState } from 'react'
import MoreOptionsSvg from '@/components/svg/MoreOptionsSvg'
import { Pressable, View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IMoreOptionsListItemProps {
	label: string
	action: () => void
}

const MoreOptionsListItem = (props: IMoreOptionsListItemProps) => {
	return (
		<Pressable onPress={props.action}>
			<Text
				className="text-sm text-white text-nowrap whitespace-nowrap"
				style={{ fontFamily: fontFamily.regular }}
			>
				{props.label}
			</Text>
		</Pressable>
	)
}

interface IMoreOptionsButtonProps {
	action: () => void
}

const MoreOptionsButton = (props: IMoreOptionsButtonProps) => {
	const insets = useSafeAreaInsets()

	const [state, setState] = useState({
		isVisible: true
	})

	const handleClickOpen = () => {
		return setState((s) => ({ ...s, isVisible: !s.isVisible }))
	}

	return (
		<>
			<Pressable
				onPress={handleClickOpen}
				className="relative w-[50px] h-[50px] border-[1px] border-black-44 rounded-full items-center justify-center"
			>
				<MoreOptionsSvg />
			</Pressable>
			{state.isVisible && (
				<View
					className="absolute border-[1px] border-white/20 rounded-[25px] right-0 gap-[15px] bg-black/20"
					style={{ padding: 20, top: insets.top + 35, zIndex: 5 }}
				>
					<MoreOptionsListItem action={props.action} label="Редактировать" />
					<MoreOptionsListItem action={props.action} label="Удалить" />
				</View>
			)}
		</>
	)
}

export default MoreOptionsButton
