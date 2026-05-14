import { z } from 'zod';

export const defaultEnv = z.object({
	SECRET_KEY: z.string().default('secret'),
	NODE_ENV: z.string().default('dev'),

	DATABASE_URL: z.string(),

	S3_REGION: z.string().default('ru-1'),
	S3_ENDPOINT: z.string(),
	S3_BUCKET_NAME: z.string(),
	S3_ACCESS_KEY_ID: z.string(),
	S3_SECRET_ACCESS_KEY_ID: z.string(),

	ACCESS_TOKEN_EXPIRATION_TIME: z.string().default('30m'),
	REFRESH_TOKEN_EXPIRATION_TIME: z.string().default('30d'),

	EMAIL_HOST: z.string(),
	EMAIL_USERNAME: z.string(),
	EMAIL_PASSWORD: z.string(),
});

export type Env = z.infer<typeof defaultEnv>;
