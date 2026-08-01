import React, { useCallback, useMemo, useState } from 'react'
import FullscreenImageViewer from '@/components/FullscreenImageViewer'

export const useFullscreenImageViewer = () => {
	const [showExternalUI, setShowExternalUI] = useState(true)
	const [visible, setVisible] = useState(false)
	const [images, setImages] = useState<string[]>([])
	const [initialIndex, setInitialIndex] = useState(0)

	const open = useCallback((images: string[], index = 0) => {
		setImages(images)
		setInitialIndex(index)
		setVisible(true)
		setShowExternalUI(true)
	}, [])

	const close = useCallback(() => {
		setVisible(false)
		setShowExternalUI(false)
	}, [])

	const viewer = useMemo(
		() => (
			<FullscreenImageViewer
				visible={visible}
				images={images}
				initialIndex={initialIndex}
				onClose={close}
				showExternalUI={showExternalUI}
			/>
		),
		[visible, images, initialIndex, close, showExternalUI]
	)

	return {
		open,
		close,
		viewer,
		showExternalUI
	}
}
