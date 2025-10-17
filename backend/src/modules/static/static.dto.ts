export namespace StaticDto {
	export type UploadedFiles = Record<string, string>;

	export type UploadedFile = {
		key: string;
	};

	export type UploadedFileUrl = {
		url: string;
	};
}
