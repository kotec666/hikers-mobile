import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image as RNImage } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { FlipType, ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { File } from 'expo-file-system'
import { CropFrame, ImageEditorFinalizeOptions, ImageEditorResult, MIN_CROP_SIZE, Rect } from './types'

type UseImageEditorParams = {
	sourceUri: string
	/** Размер квадратного (или произвольного) контейнера, в котором показывается фото для кропа */
	containerWidth: number
	containerHeight: number
	/** 'circle' всегда форсирует пропорции 1:1, независимо от setAspectLock */
	frame?: CropFrame
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Удаляет файл, если он существует, без падения на ошибке — используем для чистки промежуточных рендеров */
const deleteFileQuietly = async (uri: string) => {
	try {
		const file = new File(uri)
		if (file.exists) await file.delete()
	} catch {
		// не критично — не должно ронять UX редактирования
	}
}

/**
 * Вычисляет прямоугольник, в который изображение вписывается по принципу "contain"
 * внутри контейнера заданного размера.
 */
const fitContain = (imgW: number, imgH: number, boxW: number, boxH: number): Rect => {
	const imgAspect = imgW / imgH
	const boxAspect = boxW / boxH

	let width: number
	let height: number

	if (imgAspect > boxAspect) {
		width = boxW
		height = boxW / imgAspect
	} else {
		height = boxH
		width = boxH * imgAspect
	}

	return {
		x: (boxW - width) / 2,
		y: (boxH - height) / 2,
		width,
		height
	}
}

export function useImageEditor({ sourceUri, containerWidth, containerHeight, frame = 'square' }: UseImageEditorParams) {
	const [workingUri, setWorkingUri] = useState(sourceUri)
	const [workingWidth, setWorkingWidth] = useState(0)
	const [workingHeight, setWorkingHeight] = useState(0)
	const [isProcessing, setIsProcessing] = useState(true) // true пока грузим начальные размеры
	const [aspectLockState, setAspectLock] = useState<number | null>(frame === 'circle' ? 1 : null)

	// 'circle' всегда рисуется как 1:1, независимо от того, что выбрано в UI пропорций
	const aspectLock = frame === 'circle' ? 1 : aspectLockState

	// Прямоугольник, в котором фактически отрисовано фото внутри контейнера (contain-fit)
	const displayRect = useMemo(
		() => fitContain(workingWidth || 1, workingHeight || 1, containerWidth, containerHeight),
		[workingWidth, workingHeight, containerWidth, containerHeight]
	)

	// Координаты рамки кропа — в системе координат контейнера (пиксели экрана)
	const rectX = useSharedValue(0)
	const rectY = useSharedValue(0)
	const rectW = useSharedValue(0)
	const rectH = useSharedValue(0)

	// Границы, внутри которых должна оставаться рамка кропа — обновляются реанимированным способом
	const boundsX = useSharedValue(0)
	const boundsY = useSharedValue(0)
	const boundsW = useSharedValue(0)
	const boundsH = useSharedValue(0)

	const resetCropToFull = useCallback(() => {
		let w = displayRect.width
		let h = displayRect.height

		if (aspectLock) {
			if (w / h > aspectLock) {
				w = h * aspectLock
			} else {
				h = w / aspectLock
			}
		}

		rectX.value = displayRect.x + (displayRect.width - w) / 2
		rectY.value = displayRect.y + (displayRect.height - h) / 2
		rectW.value = w
		rectH.value = h

		boundsX.value = displayRect.x
		boundsY.value = displayRect.y
		boundsW.value = displayRect.width
		boundsH.value = displayRect.height
	}, [displayRect, aspectLock, rectX, rectY, rectW, rectH, boundsX, boundsY, boundsW, boundsH])

	// Загрузка исходных размеров изображения при первом открытии редактора
	useEffect(() => {
		RNImage.getSize(
			sourceUri,
			(width, height) => {
				setWorkingUri(sourceUri)
				setWorkingWidth(width)
				setWorkingHeight(height)
				setIsProcessing(false)
			},
			() => setIsProcessing(false)
		)
	}, [sourceUri])

	// Пересчитываем рамку кропа при смене фото (после rotate/flip), первой загрузке размеров,
	// смене режима пропорций или размера контейнера.
	useEffect(() => {
		if (workingWidth && workingHeight) resetCropToFull()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workingUri, containerWidth, containerHeight, aspectLock, workingWidth, workingHeight])

	// Последний рендер после rotate/flip никогда не "перекрывается" следующим вызовом
	// applyManipulation (раз редактор закрывают) — чистим его сами при размонтировании.
	// sourceUri не трогаем: это чужой файл, вызывающий код сам решает, что с ним делать.
	const workingUriRef = useRef(workingUri)

	// Синхронизация рефа вынесена в отдельный эффект без массива зависимостей — он выполняется
	// после каждого рендера, но уже не во время самого рендера, поэтому не нарушает react-hooks/refs
	useEffect(() => {
		workingUriRef.current = workingUri
	})

	useEffect(() => {
		return () => {
			if (workingUriRef.current !== sourceUri) {
				void deleteFileQuietly(workingUriRef.current)
			}
		}
	}, [sourceUri])

	const applyManipulation = useCallback(
		async (apply: (ctx: ReturnType<typeof ImageManipulator.manipulate>) => void) => {
			setIsProcessing(true)
			try {
				const previousUri = workingUri
				const ctx = ImageManipulator.manipulate(workingUri)
				apply(ctx)
				const rendered = await ctx.renderAsync()
				const result = await rendered.saveAsync({ format: SaveFormat.PNG, compress: 1 })
				setWorkingUri(result.uri)
				setWorkingWidth(result.width)
				setWorkingHeight(result.height)

				// Предыдущий рендер (после rotate/flip) больше никому не нужен — чистим,
				// но не трогаем самый первый sourceUri: это чужой файл, мы его не создавали
				if (previousUri !== sourceUri) {
					void deleteFileQuietly(previousUri)
				}
			} finally {
				setIsProcessing(false)
			}
		},
		[workingUri, sourceUri]
	)

	const rotate = useCallback(
		(direction: 'cw' | 'ccw') => applyManipulation((ctx) => ctx.rotate(direction === 'cw' ? 90 : -90)),
		[applyManipulation]
	)

	const flip = useCallback(
		(direction: 'horizontal' | 'vertical') =>
			applyManipulation((ctx) => ctx.flip(direction === 'horizontal' ? FlipType.Horizontal : FlipType.Vertical)),
		[applyManipulation]
	)

	/** Переводит текущую рамку кропа (в пикселях контейнера) в пиксели реального изображения */
	const getCropRectInImageSpace = useCallback((): Rect => {
		const scale = workingWidth / displayRect.width

		const x = clamp((rectX.value - displayRect.x) * scale, 0, workingWidth)
		const y = clamp((rectY.value - displayRect.y) * scale, 0, workingHeight)
		const width = clamp(rectW.value * scale, 1, workingWidth - x)
		const height = clamp(rectH.value * scale, 1, workingHeight - y)

		return {
			x: Math.round(x),
			y: Math.round(y),
			width: Math.round(width),
			height: Math.round(height)
		}
	}, [workingWidth, workingHeight, displayRect, rectX, rectY, rectW, rectH])

	const finalize = useCallback(
		async (options: ImageEditorFinalizeOptions = {}): Promise<ImageEditorResult> => {
			setIsProcessing(true)
			try {
				const crop = getCropRectInImageSpace()
				const ctx = ImageManipulator.manipulate(workingUri)
				ctx.crop({ originX: crop.x, originY: crop.y, width: crop.width, height: crop.height })
				if (options.resize)
					ctx.resize({ width: options.resize.width ?? null, height: options.resize.height ?? null })

				const rendered = await ctx.renderAsync()
				return await rendered.saveAsync({
					format: options.format ?? SaveFormat.JPEG,
					compress: options.compress ?? 0.85,
					base64: options.base64 ?? false
				})
			} finally {
				setIsProcessing(false)
			}
		},
		[workingUri, getCropRectInImageSpace]
	)

	return {
		workingUri,
		isProcessing,
		displayRect,
		frame,
		aspectLock,
		// no-op под капотом при frame === 'circle' — 1:1 форсируется вне зависимости от выбора
		setAspectLock,
		rotate,
		flip,
		finalize,
		// шаред-значения для CropOverlay
		rectX,
		rectY,
		rectW,
		rectH,
		boundsX,
		boundsY,
		boundsW,
		boundsH,
		minCropSize: MIN_CROP_SIZE
	}
}
