import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import {Colors} from "@/constants/Colors";
import './../global.css'
import {fontFamily} from "@/constants/Fonts";

export default function RootLayout() {
    const [loaded] = useFonts({
        [fontFamily.regular]: require('../assets/fonts/Manrope-Regular-400.otf'),
        [fontFamily.medium]: require('../assets/fonts/Manrope-Medium-500.otf'),
        [fontFamily.bold]: require('../assets/fonts/Manrope-Bold-700.otf'),
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
        <Stack screenOptions={{
            contentStyle: {
                backgroundColor: Colors["black-0d"],
            }
        }}>
            {/*<Stack.Screen name="index" options={{headerShown: false}}/>*/}
            <Stack.Screen name="auth" options={{headerShown: false}}/>
        </Stack>
    );
}
