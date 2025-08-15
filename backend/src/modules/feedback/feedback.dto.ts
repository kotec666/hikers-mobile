export namespace Feedback {
	export type Request = {
		email: string;
		text: string;
	};

	export type Response = {
		success: boolean;
	};
}
