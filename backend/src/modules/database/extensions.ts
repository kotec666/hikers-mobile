import { sql } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

/** Сортировка по возрастанию с регулированием позиции нуллов */
export function asc(col: PgColumn, nulls: 'last' | 'first' = 'last') {
	switch (nulls) {
		case 'last':
			return sql`${col} ASC NULLS LAST`;
		case 'first':
			return sql`${col} ASC NULLS FIRST`;

		default:
			throw new Error('Bad nulls ordering type');
	}
}

/** Сортировка по убыванию с регулированием позиции нуллов */
export function desc(col: PgColumn, nulls: 'last' | 'first' = 'last') {
	switch (nulls) {
		case 'last':
			return sql`${col} DESC NULLS LAST`;
		case 'first':
			return sql`${col} DESC NULLS FIRST`;

		default:
			throw new Error('Bad nulls ordering type');
	}
}
