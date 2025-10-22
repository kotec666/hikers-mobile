export function enumToPgEnum<T extends Record<string, any>>(someEnum: T): [T[keyof T], ...T[keyof T][]] {
	return Object.values(someEnum).map((value: any) => `${value}`) as any;
}
