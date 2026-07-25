import { SQL, sql } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';

export function enumToPgEnum<T extends Record<string, any>>(someEnum: T): [T[keyof T], ...T[keyof T][]] {
	return Object.values(someEnum).map((value: any) => `${value}`) as any;
}

export function lower(email: AnyPgColumn): SQL {
	return sql`lower(${email})`;
}
