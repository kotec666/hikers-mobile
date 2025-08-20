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
import {LinkCustom} from "@/components/ui/LinkCustom";

enum AUTH_MODE {
    AUTH = 'auth',
    REGISTRATION = 'registration'
}

const AuthPage = () => {
    const insets = useSafeAreaInsets()
    const [data, setData] = useState<{
        isChecked: boolean
        mode: AUTH_MODE
    }>({
        isChecked: false,
        mode: AUTH_MODE.AUTH
    })

    const handleClickAction = () => {
        return
    }

    const handleClickRedirect = () => {
        return setData(s => ({...s, mode: s.mode === AUTH_MODE.AUTH ? AUTH_MODE.REGISTRATION : AUTH_MODE.AUTH}))
    }

    return (
        <SafeAreaProvider style={{paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Container className="flex-1 mb-[10px]">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="flex-grow mt-[20px]">
                            <Text className="text-white text-xl" style={{fontFamily: fontFamily.bold}}>
                                {data.mode === AUTH_MODE.AUTH ? 'Авторизация' : 'Регистрация'}
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
                    {data.mode !== AUTH_MODE.AUTH && (
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View className="flex-row gap-[10px]">
                                <View className="pt-[3px]">
                                    <Checkbox
                                        value={data.isChecked}
                                        onValueChange={() => setData(s => ({...s, isChecked: !s.isChecked}))}
                                    />
                                </View>
                                <Text className="flex-shrink mb-[37px] text-gray-ab text-[11px]"
                                      style={{fontFamily: fontFamily.regular}}>
                                    Согласен с <LinkCustom
                                    href="/document"
                                    text="условиями обработки"
                                    className="text-blue-3d"
                                /> персональных данных
                                    и <LinkCustom
                                    href="/document"
                                    text="политикой конфиденциальности"
                                    className="text-blue-3d"
                                />
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                    <Button
                        variant="white"
                        onPress={handleClickAction}
                        // isLoading
                    >
                        {data.mode === AUTH_MODE.AUTH ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                </Container>
            </KeyboardAvoidingView>
            <Container className="pb-[40px]">
                <Button variant="white" onPress={handleClickRedirect}>
                    {data.mode === AUTH_MODE.AUTH ? 'Зарегистрироваться' : 'Войти'}
                </Button>
            </Container>
            <StatusBar style="light"/>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
})

export default AuthPage
