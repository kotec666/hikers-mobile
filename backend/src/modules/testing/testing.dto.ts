export namespace Testing {
	export type Entity = {
		id: string;
		text: string | null;
		createdAt: Date;
	};

	export type Request = {
		text: string;
	};

	export type StatusResponse = {
		success: boolean;
	};
}
