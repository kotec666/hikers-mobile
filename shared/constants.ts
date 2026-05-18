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

export const FREE_COLORS = {
	black: 'rgb(0, 0, 0)',
	'black-0d': 'rgb(13, 13, 13)',
	'black-25': 'rgb(37, 37, 37)',
	'gray-3a': 'rgb(58, 58, 58)',
	'black-44': 'rgb(68, 68, 68)',
	'black-5c': 'rgb(92, 92, 92)',
	'gray-92': 'rgb(146, 146, 146)',
	'gray-9a': 'rgb(154, 154, 154)',
	'gray-ab': 'rgb(171, 171, 171)',
	'gray-d5': 'rgb(213, 213, 213)',
	'gray-d9': 'rgb(217, 217, 217)',
	'blue-3a': 'rgb(58, 114, 255)',
	'blue-00': 'rgb(0, 166, 255)',
	'blue-3d': 'rgb(61, 173, 255)',
	'blue-98': 'rgb(152, 212, 255)',
	'red-3a': 'rgb(58, 26, 26)',
	'red-55': 'rgb(85, 34, 34)',
	'red-8b': 'rgb(139, 47, 47)',
	'red-ff': 'rgb(255, 0, 4)',
	'red-ff4': 'rgb(255, 68, 68)',
	'red-ff9': 'rgb(255, 152, 154)',
	'green-main': 'rgb(34, 203, 90)',
	'green-20d': 'rgb(32, 220, 82)',
	'yellow-main': 'rgb(255, 200, 21)',
	'yellow-ffd': 'rgb(255, 217, 25)',
	'yellow-ddf': 'rgb(221, 255, 60)',
	'orange-main': 'rgb(255, 110, 0)',
	'purple-87': 'rgb(135, 79, 255)',
};

export const EMAIL_CONFIRMATION_CODE_SIZE = 5;
export const EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS = 1 * 60 * 1000; // 1 мин
export const EMAIL_CONFIRMATION_CODE_TTL_MS = 30 * 60 * 1000; // 30 мин

export const MAX_PASSWORD_RECOVERY_ATTEMPTS = 5;
export const PASSWORD_RECOVERY_CODE_SIZE = 5;
export const PASSWORD_RECOVERY_CODE_TIMEOUT_MS = 10 * 60 * 1000; // 10 мин. Таймаут после нескольих неверных попыток
export const PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS = 1 * 60 * 1000; // 1 мин
export const PASSWORD_RECOVERY_CODE_TTL_MS = 1 * 60 * 1000; // 30 мин
