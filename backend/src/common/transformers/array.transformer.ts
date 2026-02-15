export function toArray(value: any): any[] {
	if (typeof value === 'string') {
		return value.replaceAll(', ', ',').split(',');
	}
	return Array.isArray(value) ? value : [value];
}
