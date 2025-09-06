import React, { ReactElement, useState } from 'react'
import { Pressable } from 'react-native'
import Popup from '@/components/ui/Popup'
import MoreOptionsListItem from '@/components/ui/MoreOptionsButton/MoreOptionsListItem'

interface IMoreOptionsButtonProps {
	action: () => void
	icon: ReactElement
}

const MoreOptionsButton = (props: IMoreOptionsButtonProps) => {
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
				{props.icon}
			</Pressable>
			{state.isVisible && (
				<Popup>
					<MoreOptionsListItem action={props.action} label="Редактировать" />
					<MoreOptionsListItem action={props.action} label="Удалить" />
				</Popup>
			)}
		</>
	)
}

export default MoreOptionsButton
