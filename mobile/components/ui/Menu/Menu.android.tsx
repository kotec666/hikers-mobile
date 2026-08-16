import { Text, View } from 'react-native'
import { Motion } from '@legendapp/motion'
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
				// Motion.Pressable — единственный Pressable триггера: передаёт контекст pressed
				// вложенным Motion.View с whileTap (кнопка в RoundedButton и пр.), но сам не
				// перехватывается ими — «кнопка в кнопке» не возникает, меню открывается.
				<Motion.Pressable onPress={open}>
					{children ?? <Text style={{ fontSize: 20, color: 'white' }}>⋯</Text>}
				</Motion.Pressable>
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
