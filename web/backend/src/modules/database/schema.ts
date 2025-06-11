import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * MODELS
 */

// Feedback
export const feedback = pgTable('feedback', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	text: text('text'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
