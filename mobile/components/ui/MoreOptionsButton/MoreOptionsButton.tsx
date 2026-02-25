import React, { ReactElement, useState } from 'react'
import Popup from '@/components/ui/Popup'
import MoreOptionsListItem from '@/components/ui/MoreOptionsButton/MoreOptionsListItem'
import { Motion } from '@legendapp/motion'

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
			<Motion.Pressable onPress={handleClickOpen}>
				<Motion.View
					className="relative w-[50px] h-[50px] border-[1px] border-black-44 rounded-full items-center justify-center"
					whileTap={{ scale: 0.8 }}
					transition={{
						type: 'spring',
						damping: 20,
						stiffness: 400
					}}
				>
					{props.icon}
				</Motion.View>
			</Motion.Pressable>
			{state.isVisible && (
				<Popup onClose={() => setState((s) => ({ ...s, isVisible: false }))}>
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
