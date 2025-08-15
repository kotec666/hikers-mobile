import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {Text, View} from "react-native";
import {fontFamily} from "@/constants/Fonts";
import { Container } from "@/components/ui/Container";
import {Button} from "@/components/ui/Button";
import {InputIcon} from "@/components/ui/InputIcon";

const AuthPage = () => {
    const insets = useSafeAreaInsets()
    return (
        <SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <Container className="flex-1 pb-[40px]">
                <View className="flex-grow">
                    <Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
                        Авторизация
                    </Text>
                    <View className="gap-[10px]">
                        <InputIcon keyboardType="email-address" placeholder="Введите email" onChangeText={() => {}} />
                        <InputIcon keyboardType="visible-password" placeholder="Введите пароль" />
                    </View>
                </View>
                <View className="gap-[10px]">
                    <Button variant="white">
                        Войти
                    </Button>
                    <Button variant="white">
                        Зарегистрироваться
                    </Button>
                </View>
            </Container>
            <StatusBar style="light" />
        </SafeAreaProvider>
    )
}

export default AuthPage
