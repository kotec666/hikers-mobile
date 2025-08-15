import {PropsWithChildren} from "react";
import {cn} from "@/helpers/cn";
import {Pressable, Text} from "react-native";
import {fontFamily} from "@/constants/Fonts";

export interface Props extends PropsWithChildren {
    className?: string
}

export function Button({ children, className }: Props) {
    return (
        <Pressable className={cn(
            "bg-white rounded-full w-full h-[50px] flex justify-center items-center flex-row",
            className,
        )}>
            <Text className="text-sm" style={{ fontFamily: fontFamily.bold }}>
                {children}
            </Text>
        </Pressable>
    )
}

