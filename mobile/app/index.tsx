import { View } from "react-native";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {Slider} from "@/components/Slider/Slider";
import {slides} from "@/constants/Slider";

const HelloPage = () => {
    const insets = useSafeAreaInsets()
    return (
        <SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="flex-1 justify-center items-center">
               <Slider itemList={slides} />
            </View>
            <StatusBar style="light" />
        </SafeAreaProvider>
    )
}

export default HelloPage
