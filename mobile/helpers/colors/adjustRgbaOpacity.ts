export const adjustRgbaOpacity = (color: string, transform: (alpha: number) => number): string => {
	const match = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/)

	if (!match) {
		throw new Error(`Invalid color format: ${color}`)
	}

	const r = Number(match[1])
	const g = Number(match[2])
	const b = Number(match[3])
	const a = match[4] !== undefined ? Number(match[4]) : 1

	let newAlpha = transform(a)

	// clamp 0–1
	newAlpha = Math.max(0, Math.min(1, newAlpha))

	return `rgba(${r}, ${g}, ${b}, ${newAlpha})`
}
