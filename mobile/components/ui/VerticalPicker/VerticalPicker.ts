import { Platform } from 'react-native'
import VerticalPickerAndroid from './VerticalPicker.android'
import VerticalPickerIOS from './VerticalPicker.ios'

export default Platform.select({
	ios: VerticalPickerIOS,
	android: VerticalPickerAndroid,
	default: VerticalPickerAndroid
})
