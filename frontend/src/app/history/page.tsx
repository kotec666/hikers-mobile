'use client'
import React, { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { format } from 'date-fns'
import './map.css'
import dynamic from 'next/dynamic'
import { getExtendedDetails, getMyHistory, ITraining, ITrainingPoint } from '@/api/workout'
import { kalmanFilter } from '@/helpers/kalmanFilter'
const MapComponent = dynamic(() => import('./components/MapComponent'), { ssr: false })

export default function Page() {
	const [token, setToken] = useState('')
	const [history, setHistory] = useState<ITraining[]>([])
	const [rawPoints, setRawPoints] = useState<ITrainingPoint[]>([])
	const [smoothPoints, setSmoothPoints] = useState<ITrainingPoint[]>([])
	const [rawMap, setRawMap] = useState<L.Map | null>(null)
	const [smoothMap, setSmoothMap] = useState<L.Map | null>(null)

	const handleClickFetchHistory = async () => {
		const history = await getMyHistory(token)
		setHistory(history)
	}
	const handleClickOnHistoryItem = async (trainingId: string) => {
		const details = await getExtendedDetails(trainingId, token)
		const newPoints = details.participants[0].route.points
		setRawPoints(newPoints)
		const smoothedPoints = kalmanFilter(newPoints)
		console.log(newPoints)
		setSmoothPoints(smoothedPoints)
	}

	useEffect(() => {
		if (!rawMap || !smoothMap) return

		let isSyncing = false

		const sync = (source: L.Map, target: L.Map) => {
			if (isSyncing) return
			isSyncing = true

			target.setView(source.getCenter(), source.getZoom(), {
				animate: false
			})

			isSyncing = false
		}

		const onRawMove = () => sync(rawMap, smoothMap)
		const onSmoothMove = () => sync(smoothMap, rawMap)

		rawMap.on('move zoom', onRawMove)
		smoothMap.on('move zoom', onSmoothMove)

		return () => {
			rawMap.off('move zoom', onRawMove)
			smoothMap.off('move zoom', onSmoothMove)
		}
	}, [rawMap, smoothMap])

	return (
		<div className="h-screen w-full flex flex-col bg-gray-50">
			{/* Token Input */}
			<div className="p-4 bg-white shadow flex items-end gap-4 border-b">
				<div className="flex flex-col w-72">
					<label className="text-sm font-medium text-gray-700 mb-1">Token авторизации</label>
					<input
						value={token}
						onChange={(e) => setToken(e.target.value)}
						className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 text-gray-800"
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
				<div className="flex-1 flex flex-col md:flex-row h-full">
					{/* Raw Map */}
					<div className="flex-1 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-gray-200">
						<div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-bold text-red-600 border border-red-200">
							RAW GPS (Noisy)
						</div>
						<MapComponent points={rawPoints} type="raw" setMapInstance={setRawMap} />
					</div>

					{/* Smoothed Map */}
					<div className="flex-1 h-1/2 md:h-full relative">
						<div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur px-3 py-1 rounded shadow text-xs font-bold text-blue-600 border border-blue-200">
							KALMAN + RDP FILTERED
						</div>
						<MapComponent points={smoothPoints} type="smooth" setMapInstance={setSmoothMap} />
					</div>
				</div>
			</div>
		</div>
	)
}
