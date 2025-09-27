import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { EnvService } from '../env/env.service';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export type DbTransaction = PgTransaction<
	NodePgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

@Injectable()
export class DatabaseService implements OnModuleInit {
	public db: ReturnType<typeof drizzle<typeof schema>>;
	private pool: Pool;

	constructor(private envService: EnvService) {}

	onModuleInit() {
		this.pool = new Pool({
			connectionString: this.envService.get('DATABASE_URL'),
		});

		this.db = drizzle(this.pool, { schema });
	}

	async onModuleDestroy() {
		await this.pool.end();
	}
}
