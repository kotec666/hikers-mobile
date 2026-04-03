import { memo, PropsWithChildren } from 'react'
import { cn } from '@/helpers/cn'
import { Pressable, PressableProps, Text, Platform, StyleSheet } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

export interface Props extends PropsWithChildren {
    className?: string
}

const StartButton = memo((props: Props & PressableProps) => {
    const { children, className } = props
    const isIOS = Platform.OS === 'ios'
    const isGlassAvailable = isIOS && isLiquidGlassAvailable()

    const renderBackground = () => {
        if (!isIOS) return null

        if (isGlassAvailable) {
            return <GlassView pointerEvents="none" style={StyleSheet.absoluteFill} />
        }

        return (
            <BlurView
                pointerEvents="none"
                tint="dark"
                intensity={15}
                style={StyleSheet.absoluteFill}
            />
        )
    }


    return (
        <Pressable
            {...props}
            className={cn(
                'w-[105px] h-[105px] rounded-[33px] flex items-center justify-center overflow-hidden',
                {
                  'bg-black/20': isIOS,
                  'bg-white': !isIOS,
                },
                className
            )}
        >
            {renderBackground()}
            <Text style={{ fontFamily: fontFamily.bold }} className={cn('text-base', {
                'text-white': isIOS,
                'text-black': !isIOS,
            })}>
                {children}
            </Text>
        </Pressable>
    )
})

StartButton.displayName = 'StartButton'

export default StartButton