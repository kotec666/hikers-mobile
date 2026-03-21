export const getNoun = (number: number, one: string, two: string, five: string) => {
	let n = Math.abs(number)
	n %= 100

	let word: string

	if (n >= 5 && n <= 20) {
		word = five
	} else {
		n %= 10
		if (n === 1) word = one
		else if (n >= 2 && n <= 4) word = two
		else word = five
	}

	return { number, word }
}
