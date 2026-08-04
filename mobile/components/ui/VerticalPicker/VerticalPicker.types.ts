export interface VerticalPickerProps<T> {
	items: T[]
	value?: T | null
	onChange: (value: T | null) => void
	mapOptionToLabel: (option: T) => string
	/** Стабильный строковый идентификатор для тега/key. По умолчанию = mapOptionToLabel. */
	mapOptionToKey?: (option: T) => string
}
