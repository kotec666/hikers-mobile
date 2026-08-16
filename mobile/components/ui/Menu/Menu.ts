import { Platform } from 'react-native'
import { Menu as MenuAndroid } from './Menu.android'
import { Menu as MenuIOS } from './Menu.ios'

export const Menu = Platform.select({
	ios: MenuIOS,
	android: MenuAndroid,
	default: MenuAndroid
})
