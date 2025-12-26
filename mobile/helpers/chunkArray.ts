const POINTS_BATCH_SIZE = 10

/**
 *
 *
 *
 */
export const chunkArray = <T>(array: T[], chunkSize: number = POINTS_BATCH_SIZE): T[][] => {
	const result: T[][] = []
	for (let i = 0; i < array.length; i += chunkSize) {
		result.push(array.slice(i, i + chunkSize))
	}
	return result
}
