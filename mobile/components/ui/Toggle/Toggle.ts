import { Platform } from 'react-native'
import ToggleAndroid from './Toggle.android'
import ToggleIOS from './Toggle.ios'

export default Platform.select({
	ios: ToggleIOS,
	android: ToggleAndroid,
	default: ToggleAndroid
})
