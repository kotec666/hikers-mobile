import { Dimensions } from 'react-native'

const COL = 3
export const CELL_MARGIN = 15
export const CELL_W = (Dimensions.get('window').width - CELL_MARGIN * (COL + 1)) / COL
export const CELL_H = 70 // фиксированная высота элемента по Y

export const getPosition = (index: number) => {
	'worklet'
	const col = index % COL
	const row = Math.floor(index / COL)
	return {
		x: col * (CELL_W + CELL_MARGIN) + CELL_MARGIN,
		y: row * (CELL_H + CELL_MARGIN) + CELL_MARGIN
	}
}

export const getOrder = (x: number, y: number) => {
	'worklet'
	const row = Math.round((y - CELL_MARGIN) / (CELL_H + CELL_MARGIN))
	const col = Math.round((x - CELL_MARGIN) / (CELL_W + CELL_MARGIN))
	return row * COL + col
}
