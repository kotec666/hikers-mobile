export const formatDistance = (meters: number): string => {
	if (meters < 1000) {
		return `${Math.round(meters)}м`
	}

	const kilometers = meters / 1000
	const formatter = new Intl.NumberFormat('ru-RU', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1
	})

	return `${formatter.format(kilometers)}км`
}
