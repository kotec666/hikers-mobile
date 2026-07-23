import React from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { GestureViewer, useGestureViewerController, useGestureViewerState } from 'react-native-gesture-image-viewer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import CloseFullscreenModeButton from '@/components/ui/CloseFullscreenModeButton'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'

interface Props {
	visible: boolean
	showExternalUI: boolean
	images: string[]
	initialIndex: number
	onClose: () => void
}

export default function FullscreenImageViewer({
	visible,
	images,
	initialIndex,
	showExternalUI,
	onClose
	// onCloseExternalUI
}: Props) {
	const insets = useSafeAreaInsets()

	const { goToPrevious, goToNext } = useGestureViewerController()
	const { currentIndex, totalCount } = useGestureViewerState()

	return (
		<Modal visible={visible} animationType="none">
			<View style={{ flex: 1, backgroundColor: 'black' }}>
				<GestureViewer
					data={images}
					initialIndex={initialIndex}
					onDismiss={onClose}
					// onDismissStart={onCloseExternalUI}
					enableLoop
					ListComponent={FlatList}
					backdropStyle={{ backgroundColor: Colors['black-0d'] }}
					renderItem={(image) => (
						<Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
					)}
					renderContainer={(children, helpers) => (
						<View style={{ flex: 1 }}>
							{children}

							{showExternalUI && (
								<CloseFullscreenModeButton insetTop={insets.top} onPress={helpers.dismiss} />
							)}
						</View>
					)}
				/>

				{showExternalUI && (
					<View
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: insets.bottom + 10
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-around',
								alignItems: 'center'
							}}
						>
							<Pressable onPress={goToPrevious}>
								<ArrowDownSvg size={30} style={{ transform: [{ rotate: '90deg' }] }} />
							</Pressable>

							<Text style={{ color: 'white' }}>
								{currentIndex + 1} / {totalCount}
							</Text>

							<Pressable onPress={goToNext}>
								<ArrowDownSvg size={30} style={{ transform: [{ rotate: '270deg' }] }} />
							</Pressable>
						</View>
					</View>
				)}
			</View>
		</Modal>
	)
}
