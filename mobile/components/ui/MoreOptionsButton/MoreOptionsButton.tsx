import React, { ReactElement, useState } from 'react'
import { Pressable } from 'react-native'
import Popup from '@/components/ui/Popup'
import MoreOptionsListItem from '@/components/ui/MoreOptionsButton/MoreOptionsListItem'

interface IMoreOptionsButtonProps {
	params: { label: string; action: () => void }[]
	icon: ReactElement
}

const MoreOptionsButton = (props: IMoreOptionsButtonProps) => {
	const [state, setState] = useState({
		isVisible: false
	})

	const handleClickOpen = () => {
		return setState((s) => ({ ...s, isVisible: !s.isVisible }))
	}

	const handleClickAction = (cb?: () => void) => {
		cb?.()
		return setState((s) => ({ ...s, isVisible: false }))
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
					{props.params.map((param) => (
						<MoreOptionsListItem
							key={param.label}
							action={() => handleClickAction(param.action)}
							label={param.label}
						/>
					))}
				</Popup>
			)}
		</>
	)
}

export default MoreOptionsButton
