import { View } from "react-native";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {Slider} from "@/components/Slider/Slider";
import {slides} from "@/constants/Slider";
import {useRouter} from 'expo-router';
import {Button} from "@/components/ui/Button";

const HelloPage = () => {
    const insets = useSafeAreaInsets()
    const router = useRouter();

    return (
        <SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="flex-1 pb-[40px]">
                <Slider itemList={slides}>
                    <Button variant="white" onPress={() => router.navigate('/auth')}>
                        Войти
                    </Button>
                </Slider>
            </View>
            <StatusBar style="light" />
        </SafeAreaProvider>
    )
}

export default HelloPage
