/**
 * Возвращает случайный hex-цвет в формате "#RRGGBB".
 * @param useCrypto - если true и доступен Web Crypto API, используется crypto.getRandomValues (лучше равномерность).
 * @param includeHash - если false, возвращает "RRGGBB" без ведущего '#'.
 */
export function randomHexColor({
	useCrypto = false,
	includeHash = true
}: {
	useCrypto?: boolean
	includeHash?: boolean
} = {}): string {
	// helper: число 0..255 -> 2-символьный hex
	const toHex = (n: number) => n.toString(16).padStart(2, '0')

	let r: number
	let g: number
	let b: number

	if (useCrypto && typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
		const arr = new Uint8Array(3)
		crypto.getRandomValues(arr) // заполняет случайными байтами
		r = arr[0]
		g = arr[1]
		b = arr[2]
	} else {
		r = Math.floor(Math.random() * 256)
		g = Math.floor(Math.random() * 256)
		b = Math.floor(Math.random() * 256)
	}

	const hex = `${toHex(r)}${toHex(g)}${toHex(b)}`
	return includeHash ? `#${hex}` : hex
}
