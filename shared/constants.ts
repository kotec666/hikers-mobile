export const MAX_FILE_SIZE_MEGABYTES = 5;
export const POST_MAX_FILES_COUNT = 10;

export const VALID_IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/avif',
	'image/heic',
	'image/heif',
	'image/tiff',
	'image/bmp',
	'image/svg+xml',
	'image/x-icon',
	'image/vnd.microsoft.icon',
];

export const VALID_VIDEO_MIME_TYPES = [
	'video/mp4',
	'video/mpeg',
	'video/ogg',
	'video/webm',
	'video/quicktime',
	'video/x-msvideo',
	'video/x-matroska',
	'video/x-flv',
	'video/3gpp',
	'video/3gpp2',
	'video/x-ms-wmv',
	'video/x-m4v',
];

export const EMAIL_CONFIRMATION_CODE_SIZE = 5;
export const EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS = 1 * 60 * 1000; // 1 мин
export const EMAIL_CONFIRMATION_CODE_TTL_MS = 30 * 60 * 1000; // 30 мин

export const PASSWORD_RECOVERY_CODE_SIZE = 5;
export const PASSWORD_RECOVERY_CODE_TIMEOUT_MS = 10 * 60 * 1000; // 10 мин. Таймаут после нескольих неверных попыток
export const PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS = 1 * 60 * 1000; // 1 мин
export const PASSWORD_RECOVERY_CODE_TTL_MS = 1 * 60 * 1000; // 30 мин
