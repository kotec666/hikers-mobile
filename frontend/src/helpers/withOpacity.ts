export const withOpacity = (color: string, opacity: number) => {
	const rgb = color.match(/\d+/g)

	if (!rgb) return color

	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
}
