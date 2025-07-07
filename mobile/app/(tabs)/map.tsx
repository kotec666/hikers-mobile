import {Pressable, StyleSheet, View, Text} from 'react-native';
import {Polyline, Yamap} from "react-native-yamap-plus";
import UserLocationMarker from "@/components/ui/UserLocationMarker";
import * as Location from 'expo-location'
import {useEffect, useState} from "react";
import {LocationAccuracy} from "expo-location";

export default function Map() {
    const [liveLocations, setLiveLocations] = useState<Location.LocationObject[] | []>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);


    const requestPermissions = async (): Promise<Location.PermissionStatus> => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        return foregroundStatus
    }

    useEffect(() => {
        async function getCurrentLocation() {

            const status = await requestPermissions()
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            const locationWatcher = await Location.watchPositionAsync({
                accuracy: LocationAccuracy.BestForNavigation,
            }, (location) => {

                console.log(location.coords)
                setLiveLocations(locations => {
                    return [...locations, location]
                });
            });

            // locationWatcher.remove()
        }

        getCurrentLocation();
    }, []);

    const lastLocation = liveLocations.at(-1)?.coords

    const clearLocations = () => {
        return setLiveLocations([])
    }

    return (
        <View style={styles.container}>
            <Yamap
                initialRegion={{lat: 55.751244, lon: 37.618423, zoom: 12}}
                style={styles.map}
                logoPosition={{horizontal: 'right', vertical: 'bottom'}}
                onMapLongPress={(e) => console.log('map onLongPress', e.nativeEvent)}
                followUser
                showUserPosition={false}
                userLocationIcon={{uri: '../../assets/images/user.png', height: 10, width: 10, scale: 2}}
                userLocationIconScale={2}
            >
                {lastLocation?.latitude && lastLocation?.longitude && (
                    <UserLocationMarker
                        position={{lat: lastLocation?.latitude, lon: lastLocation?.longitude}}
                        heading={lastLocation?.heading}
                    />
                )}

                <Polyline
                    points={liveLocations.map(location => ({
                        lat: location.coords.latitude,
                        lon: location.coords.longitude
                    }))}
                    strokeWidth={4}
                    strokeColor={'black'}
                    outlineColor={'orange'}
                    outlineWidth={2}
                    handled={false}
                    gapLength={5}
                    dashLength={0}
                    onPress={() => console.log('polyline press')}
                />
            </Yamap>

            <Pressable
                onPress={clearLocations}
                style={styles.button}
            >
                <Text style={styles.buttonText}>
                    Очистить live locations
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    button: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
    }
});