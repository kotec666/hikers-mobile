import {cn} from "@/helpers/cn";
import {Text, TextInput, TextInputProps, View} from "react-native";
import {fontFamily} from "@/constants/Fonts";
import {Colors} from "@/constants/Colors";
import { EmailSvg } from "@/components/svg/EmailSvg";

export interface Props extends TextInputProps {
    className?: string
}

export function InputIcon(props: Props) {
    const {className, ...restProps} = props

    return (
        <View>
            <TextInput
                style={{
                    fontFamily: fontFamily.regular,
                }}
                className={cn(
                    "bg-black-25 h-[50px] border-[1px] pl-[55px] rounded-full relative placeholder:text-gray-ab placeholder:text-[15px] text-white",
                    className,
                )}
                selectionColor={Colors['yellow-main']}
                {...restProps}
            />
            <View className="absolute top-[50%] left-[5px] -translate-y-[50%]">
                <View className="bg-black-44 w-[40px] h-[40px] rounded-[40px] items-center justify-center">
                    <Text className="text-white">
                        123
                        {/*<EmailSvg />*/}
                    </Text>
                </View>
            </View>
        </View>
    )
}

