const POINTS_BATCH_SIZE = 10

/**
 * Разбивает массив на несколько подмассивов (чанков) заданного размера.
 *
 * Эта функция полезна для обработки больших массивов данных пакетами,
 * например, для сохранения точек GPS или отправки их на сервер порциями.
 *
 * @template T - тип элементов исходного массива
 * @param {T[]} array - Исходный массив, который нужно разбить на чанки
 * @param {number} [chunkSize=POINTS_BATCH_SIZE] - Размер каждого чанка (количество элементов в подмассиве)
 * @returns {T[][]} Массив подмассивов, где каждый подмассив содержит не более `chunkSize` элементов
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5, 6, 7]
 * const chunks = chunkArray(numbers, 3)
 * // Результат: [[1, 2, 3], [4, 5, 6], [7]]
 */
export const chunkArray = <T>(array: T[], chunkSize: number = POINTS_BATCH_SIZE): T[][] => {
	const result: T[][] = []
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize))
	}
	return result
}
