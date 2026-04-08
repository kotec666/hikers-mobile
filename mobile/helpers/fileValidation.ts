import { VALID_IMAGE_MIME_TYPES, VALID_VIDEO_MIME_TYPES, POST_MAX_FILES_COUNT } from '@shared/constants'
import { getNoun } from '@/helpers/getNoun'

export interface IFileValidationResult {
	isValid: boolean
	errorMessage?: string
}

export const validateFile = (uri: string, currentFilesCount: number): IFileValidationResult => {
	// Проверка количества файлов
	if (currentFilesCount >= POST_MAX_FILES_COUNT) {
		const { number, word } = getNoun(POST_MAX_FILES_COUNT, 'файла', 'файлов', 'файлов')

		return { isValid: false, errorMessage: `Нельзя загружать больше ${number} ${word}` }
	}

	// Определяем MIME тип по расширению
	const extensionMatch = /\.(\w+)$/.exec(uri.split('/').pop() || '')
	const extension = extensionMatch ? extensionMatch[1].toLowerCase() : ''
	const mimeType = `image/${extension}`

	if (!VALID_IMAGE_MIME_TYPES.includes(mimeType) && !VALID_VIDEO_MIME_TYPES.includes(mimeType)) {
		return { isValid: false, errorMessage: 'Неподдерживаемый формат файла' }
	}

	return { isValid: true }
}
