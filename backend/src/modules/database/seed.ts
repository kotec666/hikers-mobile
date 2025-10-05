// import { drizzle } from 'drizzle-orm/node-postgres';
// import { seed } from 'drizzle-seed';
// import * as schema from './schema';

// async function main() {
// 	const db = drizzle(process.env.DATABASE_URL!);

// 	await seed(db, { users: schema.achievements }).refine((f) => ({
// 		users: {
// 			columns: {
// 				name: f.fullName(),
// 			},
// 			count: 20,
// 		},
// 	}));
// }

// main();
