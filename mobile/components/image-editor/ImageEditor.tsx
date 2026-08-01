import React, { useState } from 'react'
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useImageEditor } from './useImageEditor'
import { CropOverlay } from './CropOverlay'
import { ASPECT_RATIO_PRESETS, CropFrame, ImageEditorFinalizeOptions, ImageEditorResult } from './types'
import RotateLeftSvg from '@/components/svg/RotateLeftSvg'
import RotateRightSvg from '@/components/svg/RotateRightSvg'
import FlipHorizontalSvg from '@/components/svg/FlipHorizontalSvg'
import { Colors } from '@/constants/Colors'

type ImageEditorProps = {
	visible: boolean
	sourceUri: string | null
	onCancel: () => void
	onDone: (result: ImageEditorResult) => void
	finalizeOptions?: ImageEditorFinalizeOptions
	/** 'circle' — для аватаров: рамка кропа круглая, пропорции жёстко 1:1, выбор пропорций скрыт. По умолчанию 'square'. */
	frame?: CropFrame
}

export function ImageEditor({
	visible,
	sourceUri,
	onCancel,
	onDone,
	finalizeOptions,
	frame = 'square'
}: ImageEditorProps) {
	const { width: screenWidth, height: screenHeight } = useWindowDimensions()
	const [isSaving, setIsSaving] = useState(false)

	const containerWidth = screenWidth
	const containerHeight = screenHeight * 0.62

	if (!sourceUri) return null

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
			<GestureHandlerRootView style={styles.root}>
				<ImageEditorContent
					sourceUri={sourceUri}
					containerWidth={containerWidth}
					containerHeight={containerHeight}
					frame={frame}
					isSaving={isSaving}
					onCancel={onCancel}
					onDone={async (finalize) => {
						setIsSaving(true)
						try {
							const result = await finalize(finalizeOptions)
							onDone(result)
						} finally {
							setIsSaving(false)
						}
					}}
				/>
			</GestureHandlerRootView>
		</Modal>
	)
}

type ContentProps = {
	sourceUri: string
	containerWidth: number
	containerHeight: number
	frame: CropFrame
	isSaving: boolean
	onCancel: () => void
	onDone: (finalize: ReturnType<typeof useImageEditor>['finalize']) => void
}

function ImageEditorContent({
	sourceUri,
	containerWidth,
	containerHeight,
	frame,
	isSaving,
	onCancel,
	onDone
}: ContentProps) {
	const editor = useImageEditor({ sourceUri, containerWidth, containerHeight, frame })
	const busy = editor.isProcessing || isSaving

	return (
		<ScrollView style={styles.root}>
			<View style={styles.header}>
				<Pressable onPress={onCancel} hitSlop={12}>
					<Text style={styles.headerAction}>Отмена</Text>
				</Pressable>
				<Text style={styles.headerTitle}>Редактирование</Text>
				<Pressable onPress={() => onDone(editor.finalize)} hitSlop={12} disabled={busy}>
					<Text style={[styles.headerAction, styles.headerActionPrimary, busy && styles.disabled]}>
						Готово
					</Text>
				</Pressable>
			</View>

			<View style={[styles.canvasArea, { width: containerWidth, height: containerHeight }]}>
				<Image
					source={{ uri: editor.workingUri }}
					style={{
						position: 'absolute',
						left: editor.displayRect.x,
						top: editor.displayRect.y,
						width: editor.displayRect.width,
						height: editor.displayRect.height
					}}
					resizeMode="cover"
				/>

				<CropOverlay
					width={containerWidth}
					height={containerHeight}
					rectX={editor.rectX}
					rectY={editor.rectY}
					rectW={editor.rectW}
					rectH={editor.rectH}
					boundsX={editor.boundsX}
					boundsY={editor.boundsY}
					boundsW={editor.boundsW}
					boundsH={editor.boundsH}
					aspectLock={editor.aspectLock}
					minCropSize={editor.minCropSize}
					frame={frame}
				/>

				{busy && (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator color="#fff" size="large" />
					</View>
				)}
			</View>

			<View style={styles.toolbar}>
				<View style={styles.toolRow}>
					<ToolButton onPress={() => editor.rotate('ccw')} disabled={busy}>
						<RotateLeftSvg />
					</ToolButton>
					<ToolButton onPress={() => editor.rotate('cw')} disabled={busy}>
						<RotateRightSvg />
					</ToolButton>
					<ToolButton onPress={() => editor.flip('horizontal')} disabled={busy}>
						<FlipHorizontalSvg />
					</ToolButton>
					<ToolButton onPress={() => editor.flip('vertical')} disabled={busy}>
						<FlipHorizontalSvg style={{ transform: [{ rotate: '90deg' }] }} />
					</ToolButton>
				</View>

				{/* Для круглого кропа пропорции всегда 1:1 — выбирать нечего, ряд скрыт */}
				{frame === 'square' && (
					<View style={styles.toolRow}>
						{ASPECT_RATIO_PRESETS.map((preset) => (
							<Pressable
								key={preset.label}
								onPress={() => editor.setAspectLock(preset.value)}
								disabled={busy}
								style={[styles.aspectChip]}
							>
								<preset.icon color={editor.aspectLock === preset.value ? Colors['blue-3a'] : 'white'} />
							</Pressable>
						))}
					</View>
				)}
			</View>
		</ScrollView>
	)
}

function ToolButton({
	children,
	onPress,
	disabled
}: {
	children: React.ReactNode
	onPress: () => void
	disabled?: boolean
}) {
	return (
		<Pressable onPress={onPress} disabled={disabled} style={[styles.toolButton, disabled && styles.disabled]}>
			{children}
		</Pressable>
	)
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#000' },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 56,
		paddingBottom: 12
	},
	headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
	headerAction: { color: '#ccc', fontSize: 15 },
	headerActionPrimary: { color: '#fff', fontWeight: '700' },
	disabled: { opacity: 0.4 },
	canvasArea: { backgroundColor: '#111', alignSelf: 'center', overflow: 'hidden' },
	loadingOverlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(0,0,0,0.35)',
		alignItems: 'center',
		justifyContent: 'center'
	},
	toolbar: { paddingHorizontal: 16, paddingVertical: 20, gap: 16 },
	toolRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5 },
	toolButton: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#222',
		borderRadius: 10
	},
	aspectChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 14
	}
})
