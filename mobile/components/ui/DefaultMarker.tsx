import {Marker} from "react-native-yamap-plus-lite";
import {StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default function DefaultMarker (props: { lat: number; lon: number }) {
    return (
        <Marker
            point={{lat: props.lat, lon: props.lon}}
            scale={1.5}
            onPress={() => console.log('Custom marker pressed')}
        >
            <View style={styles.marker}>
                <Ionicons name="location" size={24} color="red" />
                <Text style={styles.markerText}>Я здесь!</Text>
            </View>
        </Marker>
    )
}

const styles = StyleSheet.create({
    marker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
    },
});