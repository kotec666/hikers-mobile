import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-yamap-plus";

interface Props {
    position: { lat: number; lon: number };
    heading?: number | null;
}

const UserLocationMarker = ({ position, heading = 0 }: Props) => {
    if (!position?.lat || !position?.lon) return null;

    return (
        <Marker point={position} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.container}>
              <View style={styles.dot}/>
          </View>
        </Marker>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        borderRadius: 60/2,
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 5
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 20/2,
        backgroundColor: "#1da1f2",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "white",
        position: 'relative',
        top: 60/2,
        left: 60/2,
        zIndex: 10,
    },
});

export default UserLocationMarker;