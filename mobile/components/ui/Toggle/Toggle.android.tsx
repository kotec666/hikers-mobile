import React from 'react'
import { View, Text, Switch, StyleSheet } from 'react-native'
import { ToggleProps } from './Toggle.types'

const ToggleAndroid: React.FC<ToggleProps> = ({
                                                  value,
                                                  onChange,
                                                  label,
                                                  disabled
                                              }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Switch
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                trackColor={{
                    false: '#ABABAB',
                    true: '#22CB5A'
                }}
                thumbColor="#ffffff"
            />
        </View>
    )
}

export default ToggleAndroid

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    label: {
        fontSize: 16,
        color: '#fff'
    }
})