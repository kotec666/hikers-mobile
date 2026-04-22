export const hexToRgba = (colorHex: string | null, opacityLevel: number): string => {
	if (!colorHex) {
		return `rgba(0, 0, 0, 1)`
	}

	let hex = colorHex.replace(/^#/, '')

	// Проверяем валидность HEX цвета
	if (!/^[0-9A-F]{3,8}$/i.test(hex)) {
		throw new Error('Invalid HEX color format')
	}

	// Проверяем валидность opacity
	if (opacityLevel < 0 || opacityLevel > 1) {
		throw new Error('Opacity must be between 0 and 1')
	}

	// Если HEX короткий (3 символа), расширяем его
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((char) => char + char)
			.join('')
	}

	if (hex.length === 8) {
		const r = parseInt(hex.substring(0, 2), 16)
		const g = parseInt(hex.substring(2, 4), 16)
		const b = parseInt(hex.substring(4, 6), 16)
		const a = parseInt(hex.substring(6, 8), 16) / 255

		return `rgba(${r}, ${g}, ${b}, ${a})`
	}

	// Преобразуем HEX в RGB
	const r = parseInt(hex.substring(0, 2), 16)
	const g = parseInt(hex.substring(2, 4), 16)
	const b = parseInt(hex.substring(4, 6), 16)

	return `rgba(${r}, ${g}, ${b}, ${opacityLevel})`
}
