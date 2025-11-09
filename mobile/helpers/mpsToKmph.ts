export const mpsToKmph = (mps: number) => {
	// 1 м/с = 3.6 км/ч
	return Math.round(mps * 3.6 * 10) / 10
}
