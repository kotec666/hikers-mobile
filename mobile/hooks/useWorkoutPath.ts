import React, { useCallback, useRef, useState } from 'react'
import { Colors } from '@/constants/Colors'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { IPoint } from '@/types/interfaces'

export interface Segment<TRef = unknown> {
	points: IPoint[]
	color: string
	polylineRef: React.RefObject<TRef | null>
}

export interface TransitionMarker {
	id: string
	type: 'pause' | 'resume'
	position: IPoint
}

interface Params<TRef> {
	createPolylineRef: () => React.RefObject<TRef | null>
	onNativeUpdate?: (segment: Segment<TRef>, points: IPoint[]) => void
}

export function useWorkoutPath<TRef>({ createPolylineRef, onNativeUpdate }: Params<TRef>) {
	// Используем useState только для триггера рендера при добавлении НОВЫХ сегментов
	const [, forceRender] = useState(0)

	const segmentsRef = useRef<Segment<TRef>[]>([])
	const transitionMarkersRef = useRef<TransitionMarker[]>([])
	const processedLocationCountRef = useRef(0)

	// ждёт и старые и новые точки (processedCount)
	const updatePath = useCallback(
		(locations: IWorkoutLocationStorageItem[]) => {
			// Если пришел пустой массив (или меньше чем было), значит сброс
			if (!locations?.length) {
				segmentsRef.current = []
				transitionMarkersRef.current = []
				processedLocationCountRef.current = 0

				forceRender((p) => p + 1)
				return
			}

			// Логика дедупликации: обрабатываем только новые точки
			const processedCount = processedLocationCountRef.current
			if (locations.length <= processedCount) {
				// Ничего нового (или пришел старый стейт), игнорируем
				return
			}

			// Берем только хвост массива
			const newLocations = locations.slice(processedCount)
			processedLocationCountRef.current = locations.length

			const activeLineColor = Colors['green-main']
			const pausedLineColor = Colors['gray-ab']

			let hasStructureChanged = false

			// Работаем с текущим массивом сегментов
			const currentSegments = segmentsRef.current

			// Получаем последний сегмент
			let lastSegment = currentSegments.length > 0 ? currentSegments[currentSegments.length - 1] : null

			// Создаем аккумулятор точек для текущего сегмента.
			// Клонируем массив точек последнего сегмента, чтобы мутировать его локально в цикле.
			// Это предотвращает O(N^2) сложность, которая возникала при spread-операторе внутри цикла.
			let workingPoints = lastSegment ? [...lastSegment.points] : []

			newLocations.forEach((loc) => {
				const newPoint: IPoint = {
					lat: loc.locationObject.coords.latitude,
					lon: loc.locationObject.coords.longitude
				}

				const isPaused = loc.paused
				const expectedColor = isPaused ? pausedLineColor : activeLineColor

				if (!lastSegment) {
					// 1. Первый сегмент
					const newSeg: Segment<TRef> = {
						points: [newPoint],
						color: expectedColor,
						polylineRef: createPolylineRef()
					}
					currentSegments.push(newSeg)

					// Обновляем текущие рабочие переменные
					lastSegment = newSeg
					workingPoints = newSeg.points
					hasStructureChanged = true
					return
				}

				if (lastSegment.color === expectedColor) {
					// 2. Состояние не изменилось -> просто добавляем точку в аккумулятор
					workingPoints.push(newPoint)
				} else {
					// 3. Состояние изменилось -> сохраняем текущий сегмент и создаем новый

					// Сначала фиксируем точки в завершенном сегменте
					lastSegment.points = workingPoints
					// Если структура меняется, React обновит это при ререндере.
					// Если бы мы не делали ререндер, нужно было бы обновить setNativeProps для этого сегмента здесь.
					// Но так как hasStructureChanged станет true, ререндер произойдет в конце.

					hasStructureChanged = true

					// Берем последнюю точку предыдущего сегмента для связки, если массив не пустой

					if (workingPoints.length > 0) {
						const transitionPoint = workingPoints[workingPoints.length - 1]
						transitionMarkersRef.current.push({
							id: `tm-${Date.now()}-${Math.random()}`,
							type: isPaused ? 'pause' : 'resume',
							position: transitionPoint
						})

						const newSeg: Segment<TRef> = {
							points: [transitionPoint, newPoint],
							color: expectedColor,
							polylineRef: createPolylineRef()
						}

						currentSegments.push(newSeg)

						// Переключаемся на новый сегмент
						lastSegment = newSeg
						workingPoints = newSeg.points
					} else {
						// Fallback если вдруг workingPoints пуст (не должно происходить при нормальной логике)
						const newSeg: Segment<TRef> = {
							points: [newPoint],
							color: expectedColor,
							polylineRef: createPolylineRef()
						}
						currentSegments.push(newSeg)
						lastSegment = newSeg
						workingPoints = newSeg.points
					}
				}
			})

			// В конце цикла обновляем точки в последнем активном сегменте из аккумулятора
			if (lastSegment) {
				lastSegment.points = workingPoints
			}

			if (hasStructureChanged) {
				// Если структура изменилась (добавились сегменты или маркеры), вызываем полный ререндер.
				// React отрисует новые сегменты с обновленными массивами точек.
				forceRender((p) => p + 1)
			} else if (lastSegment) {
				// Оптимизация: Если структура НЕ изменилась, мы просто обновили массив точек последнего сегмента.
				// Чтобы не вызывать тяжелый ререндер React, обновляем только Native Props через ref.
				onNativeUpdate?.(lastSegment, workingPoints)
			}
		},
		[createPolylineRef, onNativeUpdate]
	)

	return {
		segmentsRef,
		transitionMarkersRef,
		updatePath
	}
}
