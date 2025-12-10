'use client'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import { FitMapToRoute } from './FitToMapRoute'
import { svgIcon } from './mapIcons'
import React from 'react'
import { ITrainingPoint } from '@/api/workout'

export default function MapComponent({
	points,
	type,
	setMapInstance
}: {
	points: ITrainingPoint[]
	type: 'raw' | 'smooth'
	setMapInstance: (map: L.Map | null) => void
}) {
	return (
		<MapContainer ref={(ref) => setMapInstance(ref)} center={[51.505, -0.09]} zoom={13} className="h-full w-full">
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			{Boolean(points.length) && (
				<>
					<FitMapToRoute points={points} />
					<Polyline pathOptions={{ color: 'blue' }} positions={points} />

					{points.map((point) => (
						<Marker
							key={`${point.lat}-${point.lng}-${point.rel_ts}-${type}`}
							icon={svgIcon}
							position={[point.lat, point.lng]}
						>
							<Popup className="bg-white p-3 rounded-lg shadow-lg">
								<div className="space-y-1 text-sm">
									<div>
										<span className="font-semibold">Высота:</span> {point.alt} м
									</div>
									<div>
										<span className="font-semibold">Точность:</span>{' '}
										{point?.locationObject?.coords.accuracy} м
									</div>
									<div>
										<span className="font-semibold">Точность (высота):</span>{' '}
										{point?.locationObject?.coords.altitudeAccuracy} м
									</div>
									<div>
										<span className="font-semibold">Timestamp:</span>{' '}
										{point?.locationObject?.timestamp}
									</div>
									<div>
										<span className="font-semibold">Скорость:</span>{' '}
										{point?.locationObject?.coords.speed} м/с
									</div>
									<div>
										<span className="font-semibold">Координаты (lat, lon):</span> {point.lat},{' '}
										{point.lng}
									</div>
									<div>
										<span className="font-semibold">Скорость:</span> {point.speed_kmh} км/ч
									</div>
									<div>
										<span className="font-semibold">Пауза:</span> {point.paused ? 'Да' : 'Нет'}
									</div>
									<div>
										<span className="font-semibold">Относительное время:</span> {point.rel_ts}
									</div>
									<div>
										<span className="font-semibold">Дистанция:</span> {point.distance}
									</div>
								</div>
							</Popup>
						</Marker>
					))}
				</>
			)}
		</MapContainer>
	)
}
