import { z } from 'zod';

export const defaultEnv = z.object({
	SECRET_KEY: z.string().default('secret'),

	DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof defaultEnv>;
