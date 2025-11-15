import { PgColumn } from 'drizzle-orm/pg-core';
import { MAX_INT_VALUE, MAX_SMALLINT_VALUE, MIN_INT_VALUE, MIN_SMALLINT_VALUE } from 'src/modules/database/constants';

export function round(value: number, precision: number = 0): number {
	if (precision <= 0) return Math.round(value);
	return Math.round(value * (10 * precision)) / (10 * precision);
}

export function clampToPg(column: PgColumn, value: number): number {
	switch (column.columnType) {
		case 'PgSmallInt': {
			return Math.max(Math.min(value, MAX_SMALLINT_VALUE), MIN_SMALLINT_VALUE);
		}

		case 'PgInteger': {
			return Math.max(Math.min(value, MAX_INT_VALUE), MIN_INT_VALUE);
		}

		default:
			return value;
	}
}
