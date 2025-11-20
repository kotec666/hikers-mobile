import { Point } from 'react-native-yamap-plus'

/**
 * Вычисляет перпендикулярное расстояние от точки p до прямой, проходящей через p1 и p2
 */
const getSqSegDist = (p: Point, p1: Point, p2: Point) => {
	let x = p1.lon
	let y = p1.lat
	let dx = p2.lon - x
	let dy = p2.lat - y

	if (dx !== 0 || dy !== 0) {
		const t = ((p.lon - x) * dx + (p.lat - y) * dy) / (dx * dx + dy * dy)
		if (t > 1) {
			x = p2.lon
			y = p2.lat
		} else if (t > 0) {
			x += dx * t
			y += dy * t
		}
	}

	dx = p.lon - x
	dy = p.lat - y

	return dx * dx + dy * dy
}

/**
 * Ramer-Douglas-Peucker algorithm
 * Упрощает полилинию, отбрасывая точки, которые лежат слишком близко к прямой,
 * соединяющей соседние ключевые точки.
 *
 * @param points Исходный массив точек
 * @param sqTolerance Квадрат допуска (в градусах).
 * Для ~5 метров допуска значение около 0.0000000025 (если 1 градус ~ 111км)
 * Практическое значение для UI карт: 0.00001 (около 1 метра погрешности) - 0.00005
 */
const simplifyDPStep = (points: Point[], first: number, last: number, sqTolerance: number, simplified: Point[]) => {
	let maxSqDist = sqTolerance
	let index = -1

	for (let i = first + 1; i < last; i++) {
		const sqDist = getSqSegDist(points[i], points[first], points[last])
		if (sqDist > maxSqDist) {
			index = i
			maxSqDist = sqDist
		}
	}

	if (index > -1) {
		if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified)
		simplified.push(points[index])
		if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified)
	}
}

export const simplifyPath = (points: Point[], tolerance: number = 0.00005): Point[] => {
	if (points.length <= 2) return points

	const sqTolerance = tolerance * tolerance
	const last = points.length - 1
	const simplified = [points[0]]

	simplifyDPStep(points, 0, last, sqTolerance, simplified)
	simplified.push(points[last])

	return simplified
}
