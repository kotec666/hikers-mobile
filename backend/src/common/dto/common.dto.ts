export namespace CommonDto {
	export type RateLimited<T> = T & { remainAttempts?: number; waitMs?: number };

	export type BooleanResponse = {
		success: boolean;
	};

	export type ExistsResponse = {
		exists: boolean;
	};
}
