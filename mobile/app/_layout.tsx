import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'
import './../global.css'
import { fontFamily } from '@/constants/Fonts'
import { YamapInstance } from 'react-native-yamap-plus-lite'

YamapInstance.setLocale('ru_RU')
	.then(() => {
		YamapInstance.init('8e479a05-0cbd-4e42-8cbe-83a993ca66c9')
			.then(() => {
				console.log('init')
			})
			.catch(console.warn)
	})
	.catch(console.warn)

export default function RootLayout() {
	const [loaded] = useFonts({
		[fontFamily.regular]: require('../assets/fonts/Manrope-Regular-400.otf'),
		[fontFamily.medium]: require('../assets/fonts/Manrope-Medium-500.otf'),
		[fontFamily.bold]: require('../assets/fonts/Manrope-Bold-700.otf')
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		// <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
		//   <Stack>
		//     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		//     <Stack.Screen name="+not-found" />
		//   </Stack>
		//   <StatusBar style="auto" />
		// </ThemeProvider>
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: Colors['black-0d']
				}
			}}
		>
			<Stack.Screen name="hello-screen" options={{ headerShown: false }} />
			<Stack.Screen name="auth" options={{ headerShown: false }} />
			<Stack.Screen name="document" options={{ headerShown: false }} />
			<Stack.Screen name="map/map" options={{ headerShown: false }} />
			<Stack.Screen name="find-people" options={{ headerShown: false }} />
			<Stack.Screen name="news-feed" options={{ headerShown: false }} />
		</Stack>
	)
}
