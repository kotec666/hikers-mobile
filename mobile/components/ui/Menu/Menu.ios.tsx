import { MenuView } from '@expo/ui/community/menu'
import { TouchableOpacity, Text } from 'react-native'

// const routingIcon = Icon.select({
// 	ios: 'point.3.connected.trianglepath.dotted',
// 	android: import('@expo/material-symbols/route.xml')
// })
// const refreshIcon = Icon.select({
// 	ios: 'arrow.triangle.2.circlepath',
// 	android: import('@expo/material-symbols/refresh.xml')
// })
// const pingIcon = Icon.select({
// 	ios: 'gauge',
// 	android: import('@expo/material-symbols/speed.xml')
// })
// const editIcon = Icon.select({
// 	ios: 'square.and.pencil',
// 	android: import('@expo/material-symbols/edit.xml')
// })
// const pinIcon = Icon.select({
// 	ios: 'pin',
// 	android: import('@expo/material-symbols/keep.xml')
// })
// const deleteIcon = Icon.select({
// 	ios: 'trash',
// 	android: import('@expo/material-symbols/delete.xml')
// })

export function IOSMenu() {
	return (
		<MenuView
			title="тайтл"
			onPressAction={({ nativeEvent }) => {
				switch (nativeEvent.event) {
					case 'routing':
						console.log('Маршрутизация')
						break
					case 'refresh':
						console.log('Обновить подписку')
						break
					case 'ping':
						console.log('Пинг')
						break
					case 'edit':
						console.log('Редактировать')
						break
					case 'pin':
						console.log('Закрепить')
						break
					case 'delete':
						console.log('Удалить')
						break
				}
			}}
			actions={[
				{
					id: 'routing',
					title: 'Маршрутизация'
					// image: routingIcon
				},
				{
					id: 'refresh',
					title: 'Обновить подписку'
					// image: refreshIcon
				},
				{
					id: 'ping',
					title: 'Пинг'
					// image: pingIcon
				},
				{
					id: 'edit',
					title: 'Редактировать'
					// image: editIcon
				},
				{
					id: 'pin',
					title: 'Закрепить'
					// image: pinIcon
				},
				{
					id: 'delete',
					title: 'Удалить',
					// image: deleteIcon,
					attributes: { destructive: true }
				}
			]}
		>
			<TouchableOpacity>
				<Text style={{ fontSize: 20 }}>⋯</Text>
			</TouchableOpacity>
		</MenuView>
	)
}
