import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export const refetchAndHaptics = async <T>(cb: () => Promise<T>): Promise<T> => {
	if (Platform.OS === 'ios') {
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
	}

	return cb()
}
