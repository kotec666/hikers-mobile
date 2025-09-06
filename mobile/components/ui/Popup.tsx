import React, { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Popup = (props: PropsWithChildren) => {
	const insets = useSafeAreaInsets()
	return (
		<View
			className="absolute border-[1px] border-white/20 rounded-[25px] right-0 gap-[15px] bg-black/20"
			style={{ padding: 20, top: insets.top + 35, zIndex: 5 }}
		>
			{props.children}
		</View>
	)
}

export default Popup
