import { TFunction } from 'i18next'

type StringKeys<T> = {
	[P in keyof T]: T[P] extends string ? P : never
}[keyof T]

export const translateArr = <T extends object, K extends StringKeys<T>>(
	arr: T[],
	translateField: K | K[],
	t: TFunction<'translation', undefined>
): T[] => {
	if (!Array.isArray(translateField)) {
		return arr.map((item) => ({
			...item,
			[translateField]: t(item[translateField] as string)
		}))
	} else {
		return arr.map((item) => {
			const newItem: T = { ...item }
			translateField.forEach((field) => {
				newItem[field] = t(item[field] as string) as T[typeof field]
			})
			return newItem
		})
	}
}
