import {PropsWithChildren} from "react";
import {cn} from "@/helpers/cn";
import {Pressable, Text} from "react-native";
import {fontFamily} from "@/constants/Fonts";
import {Colors} from "@/constants/Colors";


const buttonVariantStyles = {
    default: "rounded-full w-full h-[50px] flex justify-center items-center flex-row",
    white: "bg-white",
    black: Colors['black-25'],
    gray: Colors['gray-92'],
}

const textVariantStyles = {
    default: "text-black",
    white: "text-black",
    black: "text-white",
    gray: "text-white",
}

export interface Props extends PropsWithChildren {
    className?: string
    variant: keyof typeof buttonVariantStyles;
}

export function Button({children, className, variant}: Props) {
    return (
        <Pressable
            className={cn(
                "",
                buttonVariantStyles.default,
                buttonVariantStyles[variant],
                className,
            )}
        >
            <Text className={cn("text-sm", textVariantStyles[variant])} style={{fontFamily: fontFamily.bold}}>
                {children}
            </Text>
        </Pressable>
    )
}

