'use client'
import React, { useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getExtendedDetails, getMyHistory, ITraining, ITrainingPoint } from '../../../api/workout'
import { format } from 'date-fns'
import { FitMapToRoute } from '@/app/history/components/FitToMapRoute'
import { svgIcon } from '@/app/history/components/mapIcons'
import './map.css'

export default function Page() {
	const [token, setToken] = useState('')
	const [history, setHistory] = useState<ITraining[]>([])
	const [points, setPoints] = useState<ITrainingPoint[]>([])

	const handleClickFetchHistory = async () => {
		const history = await getMyHistory(token)
		setHistory(history)
	}
	const handleClickOnHistoryItem = async (trainingId: string) => {
		const details = await getExtendedDetails(trainingId, token)
		const newPoints = details.participants[0].route.points
		setPoints(newPoints)
	}

	return (
		<div className="h-screen w-full flex flex-col bg-gray-50">
			{/* Token Input */}
			<div className="p-4 bg-white shadow flex items-end gap-4 border-b">
				<div className="flex flex-col w-72">
					<label className="text-sm font-medium text-gray-700 mb-1">Token авторизации</label>
					<input
						value={token}
						onChange={(e) => setToken(e.target.value)}
						className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Введите токен"
					/>
				</div>
				<button
					className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
					onClick={handleClickFetchHistory}
				>
					Получить историю
				</button>
			</div>

			{/* Layout: Sidebar + Map */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<div className="w-72 bg-white border-r shadow-inner overflow-y-auto p-4 space-y-4">
					<h2 className="text-lg font-semibold text-gray-800">История тренировок</h2>

					<div className="space-y-3">
						{history.map((t) => (
							<div
								key={t.id}
								onClick={() => handleClickOnHistoryItem(t.id)}
								className={`p-3 rounded-xl border flex justify-between items-center shadow-sm cursor-pointer ${
									t.finishedAt ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
								}`}
							>
								<div className="flex flex-col">
									<span className="font-medium text-gray-700">{t.type}</span>
									<span className="text-xs text-gray-500 mt-1">
										Создано: {format(t.createdAt, 'dd-MM-yy, HH:mm')}
									</span>
								</div>
								<span
									className={`text-xs font-bold px-2 py-1 rounded-lg ${
										t.finishedAt ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
									}`}
								>
									{t.finishedAt ? 'Завершена' : 'Не завершена'}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Map */}
				<div className="flex-1 h-full">
					<MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
						<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
						{Boolean(points.length) && (
							<>
								<FitMapToRoute points={points} />
								<Polyline pathOptions={{ color: 'blue' }} positions={points} />

								{points.map((point) => (
									<Marker
										key={`${point.lat}-${point.lng}-${point.rel_ts}`}
										icon={svgIcon}
										position={[point.lat, point.lng]}
									>
										<Popup className="bg-white p-3 rounded-lg shadow-lg">
											<div className="space-y-1 text-sm">
												<div>
													<span className="font-semibold">Высота:</span> {point.alt} м
												</div>
												<div>
													<span className="font-semibold">Координаты:</span> {point.lat},{' '}
													{point.lng}
												</div>
												<div>
													<span className="font-semibold">Скорость:</span> {point.speed_kmh}{' '}
													км/ч
												</div>
												<div>
													<span className="font-semibold">Пауза:</span>{' '}
													{point.paused ? 'Да' : 'Нет'}
												</div>
												<div>
													<span className="font-semibold">Относительное время:</span>{' '}
													{point.rel_ts}
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
				</div>
			</div>
		</div>
	)
}
