import {Marker} from "react-native-yamap-plus";
import {StyleSheet, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default function DefaultMarker () {
    return (
        <Marker
            point={{ lat: 55.751244, lon: 37.618423 }}
            scale={2}
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