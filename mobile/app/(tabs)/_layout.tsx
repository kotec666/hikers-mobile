import {Tabs} from 'expo-router';
import React from 'react';
import {Platform} from 'react-native';
import {HapticTab} from '@/components/HapticTab';
import {IconSymbol} from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import {Colors} from '@/constants/Colors';
import {useColorScheme} from '@/hooks/useColorScheme';
import {YamapInstance} from "react-native-yamap-plus";

YamapInstance.setLocale('ru_RU').then(() => {
    YamapInstance.init('8e479a05-0cbd-4e42-8cbe-83a993ca66c9').then(() => {
        console.log('init');
    }).catch(console.warn);
}).catch(console.warn);


export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="paperplane.fill" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({color}) => <IconSymbol size={28} name="paperplane.fill" color={color}/>,
                }}
            />
        </Tabs>
    );
}
