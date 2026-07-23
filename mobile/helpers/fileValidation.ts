import { VALID_IMAGE_MIME_TYPES, VALID_VIDEO_MIME_TYPES } from '@shared/constants'

export interface IFileValidationResult {
	isValid: boolean
	errorMessage?: string
}

const getMimeTypeByUri = (uri: string): string => {
	// Определяем MIME тип по расширению
	const extensionMatch = /\.(\w+)$/.exec(uri.split('/').pop() || '')
	const extension = extensionMatch ? extensionMatch[1].toLowerCase() : ''
	return `image/${extension}`
}

export const validateFile = (uri: string | string[]): IFileValidationResult => {
	const uris = Array.isArray(uri) ? uri : [uri]

	if (uris.length === 0) {
		return { isValid: false, errorMessage: 'Не выбрано ни одного файла' }
	}

	for (const singleUri of uris) {
		const mimeType = getMimeTypeByUri(singleUri)

		if (!VALID_IMAGE_MIME_TYPES.includes(mimeType) && !VALID_VIDEO_MIME_TYPES.includes(mimeType)) {
			return { isValid: false, errorMessage: 'Неподдерживаемый формат файла' }
		}
	}

	return { isValid: true }
}
