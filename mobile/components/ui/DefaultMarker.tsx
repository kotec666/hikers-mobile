import { Marker } from 'react-native-yamap-plus-lite'
import { StyleSheet, View } from 'react-native'

export default function DefaultMarker(props: { lat: number; lon: number }) {
	return (
		<Marker
			point={{ lat: props.lat, lon: props.lon }}
			scale={1.5}
			onPress={() => console.log('Custom marker pressed')}
		>
			<View style={styles.marker} />
		</Marker>
	)
}

const styles = StyleSheet.create({
	marker: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	markerText: {
		color: 'red',
		fontWeight: 'bold',
		fontSize: 12
	}
})
