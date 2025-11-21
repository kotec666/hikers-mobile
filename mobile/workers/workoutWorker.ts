import { createWorkletRuntime, scheduleOnRuntime, createSerializable, scheduleOnRN } from 'react-native-worklets'
import { deserializeLocations, serializeLocation } from '@/helpers/binarySerializer'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

// Создаём ворклет runtime
export const backgroundRuntime = createWorkletRuntime({ name: 'background' })

// Ворклет для десериализации буфера
function _deserializeWorklet(bufferRef: ArrayBuffer) {
	'worklet'
	const u8 = new Uint8Array(bufferRef)
	const points: IWorkoutLocationStorageItem[] = deserializeLocations(u8)
	// Возвращаем сериализуемую ссылку
	return createSerializable(points)
}

// Ворклет для сериализации одной точки
function _serializePointWorklet(point: IWorkoutLocationStorageItem) {
	'worklet'
	const bytes = serializeLocation(point)
	return createSerializable(bytes.buffer)
}

export function deserializeBuffer(buffer: ArrayBuffer): Promise<IWorkoutLocationStorageItem[]> {
	return new Promise((resolve) => {
		// Запланировать выполнение ворклета в background runtime
		scheduleOnRuntime(
			backgroundRuntime,
			(buf: ArrayBuffer) => {
				// Этот код — ворклет; мы вызываем _deserializeWorklet
				return _deserializeWorklet(buf)
			},
			buffer
		)

		// Нужно как-то получить результат обратно — можно через обратный runOnRN / callback
		// Но react-native-worklets не возвращает напрямую результат.
		// Решение: передавать callback как сериализируемую ссылку.

		// Например:
		scheduleOnRuntime(
			backgroundRuntime,
			(buf: ArrayBuffer, cbRef) => {
				const pts = _deserializeWorklet(buf)
				// scheduleOnRN — вызвать callback в RN runtime
				// @ts-ignore
				scheduleOnRN(cbRef, pts)
			},
			buffer,
			// сериализуем callback
			createSerializable((pts: IWorkoutLocationStorageItem[]) => {
				resolve(pts)
			})
		)
	})
}

export function serializePoint(point: IWorkoutLocationStorageItem): Promise<ArrayBuffer> {
	return new Promise((resolve) => {
		scheduleOnRuntime(
			backgroundRuntime,
			(pt, cbRef) => {
				const buf = _serializePointWorklet(pt)
				// @ts-ignore
				scheduleOnRN(cbRef, buf)
			},
			point,
			createSerializable((buf: ArrayBuffer) => {
				resolve(buf)
			})
		)
	})
}
