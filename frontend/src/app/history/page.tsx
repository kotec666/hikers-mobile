'use client'
import React, { useRef, useState } from 'react'
import { format } from 'date-fns'
import { getExtendedDetails, getMyHistory, ITraining } from '@/api/workout'
import { MapProvider } from '@/components/providers/map-provider'
import YandexMap, { YandexMapRef } from '@/components/ui/map/yandex-map'
import { cn } from '@/lib/utils'

export default function Page() {
	const mapRef = useRef<YandexMapRef>(null)
	const [token, setToken] = useState('')
	const [history, setHistory] = useState<ITraining[]>([])
	const [selectedId, setSelectedId] = useState<string | null>(null)

	const handleClickFetchHistory = async () => {
		const history = await getMyHistory(token)
		setHistory(history)
	}

	const handleClickOnHistoryItem = async (trainingId: string) => {
		setSelectedId(trainingId)

		const details = await getExtendedDetails(trainingId, token)
		const newPoints = details.participants[0].route.points
		mapRef.current?.setPath(newPoints)
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

			<div className="flex flex-1 overflow-hidden">
				<div className="w-72 bg-white border-r shadow-inner overflow-y-auto p-4 space-y-4">
					<h2 className="text-lg font-semibold text-gray-800">История тренировок</h2>

					<div className="space-y-3">
						{history.map((t) => (
							<div
								key={t.id}
								onClick={() => handleClickOnHistoryItem(t.id)}
								className={cn(
									'p-3 rounded-xl border flex justify-between items-center shadow-sm cursor-pointer transition',
									t.finishedAt ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300',
									'hover:ring-2 hover:ring-blue-400',
									selectedId === t.id && 'ring-2 ring-blue-600 border-blue-600 bg-blue-50'
								)}
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

				<div className="flex-1 flex flex-col md:flex-row h-full">
					<div className="flex-1 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-gray-200">
						<MapProvider
							apiUrl={`https://api-maps.yandex.ru/v3/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY}&lang=ru_RU`}
						>
							<YandexMap ref={mapRef} />
						</MapProvider>
					</div>
				</div>
			</div>
		</div>
	)
}
