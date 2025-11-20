import { Marker, Point } from 'react-native-yamap-plus'
import { Text } from 'react-native'

const DirectionMarkersDebug = ({ center, radius = 0.01 }: { center: Point; radius?: number }) => {
	const directions = [
		{ id: 'north', label: 'Север', position: { lat: center.lat + radius, lon: center.lon } },
		{ id: 'south', label: 'Юг', position: { lat: center.lat - radius, lon: center.lon } },
		{ id: 'east', label: 'Восток', position: { lat: center.lat, lon: center.lon + radius } },
		{ id: 'west', label: 'Запад', position: { lat: center.lat, lon: center.lon - radius } }
	]

	return (
		<>
			{directions.map((dir) => (
				<Marker key={dir.id} point={dir.position} zIndex={1} scale={0.5}>
					<Text
						style={{
							color: 'white',
							fontSize: 20,
							fontWeight: 'bold',
							backgroundColor: 'black',
							textAlign: 'center'
						}}
					>
						{dir.label}
					</Text>
				</Marker>
			))}
		</>
	)
}

export default DirectionMarkersDebug
