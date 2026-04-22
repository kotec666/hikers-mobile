export const setRgbaOpacity = (color: string, alpha: number): string => {
	const match = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/)

	if (!match) {
		throw new Error(`Invalid color format: ${color}`)
	}

	const r = Number(match[1])
	const g = Number(match[2])
	const b = Number(match[3])

	const clampedAlpha = Math.max(0, Math.min(1, alpha))

	return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`
}
