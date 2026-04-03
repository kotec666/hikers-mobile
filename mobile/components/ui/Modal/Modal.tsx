import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Modal as RNModal,
    ModalProps,
    KeyboardAvoidingView,
    Platform
} from 'react-native'
import CloseCross from '@/components/ui/CloseCross'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

type PROPS = ModalProps & {
    label?: string
    labelSize?: number
    isOpen: boolean
    withInput?: boolean
    blurDisabled?: boolean
    handleClose: () => void
}

const Modal = ({
                   isOpen,
                   withInput,
                   handleClose,
                   label,
                   labelSize,
                   children,
                   blurDisabled,
                   ...rest
               }: PROPS) => {
    const blurTargetRef = useBlurContext()
    const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

    const renderContent = () => {
        if (blurDisabled) {
            return (
                <View style={[styles.inner, { backgroundColor: 'black' }]}>
                    {header()}
                    {children}
                </View>
            )
        }

        if (isGlassAvailable) {
            return (
                <GlassView style={styles.glassView}>
                    <View style={styles.inner}>
                        {header()}
                        {children}
                    </View>
                </GlassView>
            )
        }

        if (Platform.OS === 'ios') {
            return (
                <BlurView style={styles.blurView} tint="dark" intensity={10}>
                    <View style={styles.inner}>
                        {header()}
                        {children}
                    </View>
                </BlurView>
            )
        }

        return (
            <BlurView
                style={styles.blurView}
                tint="dark"
                intensity={25}
                blurTarget={blurTargetRef}
                blurMethod="dimezisBlurView"
            >
                <View style={styles.inner}>
                    {header()}
                    {children}
                </View>
            </BlurView>
        )
    }

    const header = () => (
        <View style={styles.header}>
            <Text style={[styles.label, { fontSize: labelSize || 12 }]}>
                {label}
            </Text>
            <CloseCross blurDisabled={blurDisabled} handleClose={handleClose} />
        </View>
    )

    const Wrapper = withInput ? KeyboardAvoidingView : View

    return (
        <RNModal visible={isOpen} transparent animationType="fade" statusBarTranslucent {...rest}>
            <Wrapper
                style={styles.overlay}
                {...(withInput && {
                    behavior: Platform.OS === 'ios' ? 'padding' : 'height'
                })}
            >
                <View style={[styles.container, !isGlassAvailable && { borderWidth: 1 }]}>
                    {renderContent()}
                </View>
            </Wrapper>
        </RNModal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    container: {
        width: '100%',
        borderRadius: 25,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden'
    },
    glassView: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden'
    },
    blurView: {
        width: '100%',
    },
    inner: {
        padding: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    label: {
        color: '#fff'
    }
})

export default Modal