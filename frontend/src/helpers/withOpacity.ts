export const withOpacity = (color: string, opacity: number): string => {
	const alpha = Math.max(0, Math.min(1, opacity))

	const hex = color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
	if (hex) {
		let hexStr = hex[1]
		if (hexStr.length === 3) {
			hexStr = hexStr
				.split('')
				.map((c) => c + c)
				.join('')
		}
		const r = parseInt(hexStr.slice(0, 2), 16)
		const g = parseInt(hexStr.slice(2, 4), 16)
		const b = parseInt(hexStr.slice(4, 6), 16)
		return `rgba(${r}, ${g}, ${b}, ${alpha})`
	}

	const rgb = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/)
	if (rgb) {
		return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`
	}

	return color
}