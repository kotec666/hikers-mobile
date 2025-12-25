const EARTH_RADIUS = 6378137 // meters

export const metersToLatLng = (baseLat: number, baseLng: number, dNorth: number, dEast: number) => {
	const dLat = dNorth / EARTH_RADIUS
	const dLng = dEast / (EARTH_RADIUS * Math.cos((baseLat * Math.PI) / 180))

	return {
		lat: baseLat + (dLat * 180) / Math.PI,
		lng: baseLng + (dLng * 180) / Math.PI
	}
}
