import {
	MAX_FILE_SIZE_MEGABYTES,
	VALID_IMAGE_MIME_TYPES,
	VALID_VIDEO_MIME_TYPES,
	POST_MAX_FILES_COUNT
} from '@shared/constants'
import { getNoun } from '@/helpers/getNoun'

export interface IFileValidationResult {
	isValid: boolean
	errorMessage?: string
}

export const validateFile = async (uri: string, currentFilesCount: number): Promise<IFileValidationResult> => {
	try {
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

		// Проверка размера файла
		const fileInfo = await fetch(uri)
		const blob = await fileInfo.blob()
		const fileSizeMB = blob.size / 1024 / 1024

		if (fileSizeMB > MAX_FILE_SIZE_MEGABYTES) {
			const { number, word } = getNoun(MAX_FILE_SIZE_MEGABYTES, 'мегабайт', 'мегабайта', 'мегабайт')

			return { isValid: false, errorMessage: `Размер файла не должен превышать ${number} ${word}` }
		}

		return { isValid: true }
	} catch (e) {
		return { isValid: false, errorMessage: 'Ошибка при проверке файла' }
	}
}
