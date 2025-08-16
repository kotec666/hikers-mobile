import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import {fontFamily} from "@/constants/Fonts";
import {Container} from "@/components/ui/Container";
import {Button} from "@/components/ui/Button";
import {InputIcon} from "@/components/ui/InputIcon";
import EmailSvg from "@/components/svg/EmailSvg";
import PasswordSvg from "@/components/svg/PasswordSvg";
import {useState} from "react";
import Checkbox from "@/components/ui/Checkbox";

const AuthPage = () => {
    const insets = useSafeAreaInsets()
    const [data, setData] = useState({
        isChecked: false,
    })

    return (
        <SafeAreaProvider style={{paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Container className="flex-1 pb-[40px]">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="flex-row gap-[10px]">
                            <View className="pt-[3px]">
                                <Checkbox
                                    value={data.isChecked}
                                    onValueChange={() => setData(s => ({...s, isChecked: !s.isChecked}))}
                                />
                            </View>
                            <Text className="mb-[37px] text-gray-ab text-[11px]"
                                  style={{fontFamily: fontFamily.regular}}>
                                Согласен с <Text className="text-blue-3d">условиями обработки</Text> персональных данных
                                и <Text
                                className="text-blue-3d">политикой конфиденциальности</Text>
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <View className="gap-[10px]">
                        <Button variant="white">
                            Войти
                        </Button>
                        <Button variant="black">
                            Зарегистрироваться
                        </Button>
                    </View>
                </Container>
            </KeyboardAvoidingView>
            <StatusBar style="light"/>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AuthPage
