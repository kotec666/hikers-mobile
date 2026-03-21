export const toQs = <T extends Record<string, any>>(obj: T) => {
	return Object.keys(obj)
		.map((key) =>
			typeof obj[key] === 'undefined' || obj[key]?.length === 0 ? delete obj[key] : `${key}=${obj[key]}`
		)
		.filter((el) => typeof el === 'string')
		.join('&')
}
