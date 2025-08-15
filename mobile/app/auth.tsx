import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {Text, View} from "react-native";
import {fontFamily} from "@/constants/Fonts";
import {Container} from "@/components/ui/Container";
import {Button} from "@/components/ui/Button";
import {InputIcon} from "@/components/ui/InputIcon";
import EmailSvg from "@/components/svg/EmailSvg";
import PasswordSvg from "@/components/svg/PasswordSvg";

const AuthPage = () => {
    const insets = useSafeAreaInsets()

    return (
        <SafeAreaProvider style={{paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <Container className="flex-1 pb-[40px]">
                <View className="flex-grow">
                    <Text className="text-white text-xl" style={{fontFamily: fontFamily.bold}}>
                        Авторизация
                    </Text>
                    <View className="gap-[10px] mt-[65px]">
                        <InputIcon
                            textContentType="emailAddress"
                            keyboardType="email-address"
                            placeholder="Введите email"
                            error={true}
                            svg={<EmailSvg error={true}/>}
                        />
                        <InputIcon
                            isPassword
                            placeholder="Введите пароль"
                            svg={<PasswordSvg error={false}/>}
                        />
                    </View>
                </View>
                <Text className="mb-[37px] text-gray-ab text-[11px]" style={{ fontFamily: fontFamily.regular }}>
                    Согласен с <Text className="text-blue-3d">условиями обработки</Text> персональных данных и <Text className="text-blue-3d">политикой конфиденциальности</Text>
                </Text>
                <View className="gap-[10px]">
                    <Button variant="white">
                        Войти
                    </Button>
                    <Button variant="black">
                        Зарегистрироваться
                    </Button>
                </View>
            </Container>
            <StatusBar style="light"/>
        </SafeAreaProvider>
    )
}

export default AuthPage
