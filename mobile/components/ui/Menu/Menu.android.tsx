import { Pressable, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PopupMenu from '@/components/ui/Popup/PopupMenu'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import { MenuProps } from './Menu.types'

export function Menu({ actions, children, menuWidth, menuHeight, blurDisabled }: MenuProps) {
	return (
		<PopupMenu
			blurDisabled={blurDisabled}
			menuWidth={menuWidth}
			menuHeight={menuHeight}
			trigger={({ open }) => (
				<Pressable onPress={open}>
					{children ?? <Text style={{ fontSize: 20, color: 'white' }}>⋯</Text>}
				</Pressable>
			)}
		>
			{actions.map((action) => (
				<PopupMenuItem key={action.id} title={action.title} onPress={action.onPress} disabled={action.disabled}>
					{action.icon && (
						<View className="flex-row items-center gap-3">
							{action.icon}
							<Text className="text-white text-base" style={{ fontFamily: fontFamily.regular }}>
								{action.title}
							</Text>
						</View>
					)}
				</PopupMenuItem>
			))}
		</PopupMenu>
	)
}
