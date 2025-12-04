import { useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'

export function FitMapToRoute({ points }: { points: { lat: number; lng: number }[] | null }) {
	const map = useMap()

	useEffect(() => {
		if (!points || points.length === 0) return

		const latlngs = points.map((p) => [p.lat, p.lng]) as L.LatLngTuple[]

		const bounds = L.latLngBounds(latlngs)

		map.fitBounds(bounds, {
			padding: [50, 50],
			animate: true
		})
	}, [points, map])

	return null
}
