import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native'
import { Image, ImageProps } from 'expo-image'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import RotateRightSvg from '@/components/svg/RotateRightSvg'

export interface SmartImageProps extends ImageProps {
	/** Радиус скругления контейнера-обёртки (по умолчанию берётся из style.borderRadius) */
	containerBorderRadius?: number
	/** Диаметр кружка со спиннером/иконкой retry */
	indicatorSize?: number
	/** Интенсивность блюра (0-100) */
	blurIntensity?: number
	/** Отключить оверлей полностью (просто рендерит Image как есть) */
	disableLoadingOverlay?: boolean
	/** Отключить блюр (вместо BlurView будет обычная затемняющая подложка) */
	blurDisabled?: boolean
	/** Доп. стиль на контейнер-обёртку */
	containerStyle?: ViewStyle
}

/**
 * Drop-in замена для <Image /> из expo-image.
 * Показывает блюр-подложку со спиннером во время загрузки
 * и иконку retry при ошибке (как в Telegram).
 *
 * Использование: просто заменить <Image ...} /> на <SmartImage ...} />
 */
const SmartImage = ({
	containerBorderRadius,
	indicatorSize = 40,
	blurIntensity = 40,
	disableLoadingOverlay = false,
	blurDisabled = false,
	containerStyle,
	style,
	onLoadStart,
	onLoad,
	onError,
	recyclingKey,
	...imageProps
}: SmartImageProps) => {
	const blurTargetRef = useBlurContext()
	const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
	const [reloadKey, setReloadKey] = useState(0)

	const handleRetry = useCallback((e: any) => {
		e.stopPropagation?.()
		setStatus('loading')
		setReloadKey((prev) => prev + 1)
	}, [])

	const flatStyle = StyleSheet.flatten(style) || {}
	const borderRadius = containerBorderRadius ?? (flatStyle.borderRadius as number) ?? 0

	const OverlayContent = (
		<View style={styles.overlayCenter}>
			{status === 'loading' && (
				<View
					style={[
						styles.circle,
						{ width: indicatorSize, height: indicatorSize, borderRadius: indicatorSize / 2 }
					]}
				>
					<ActivityIndicator size="small" color="white" />
				</View>
			)}

			{status === 'error' && (
				<Pressable
					onPress={handleRetry}
					style={[
						styles.circle,
						{ width: indicatorSize, height: indicatorSize, borderRadius: indicatorSize / 2 }
					]}
					hitSlop={12}
				>
					<RotateRightSvg size={indicatorSize / 1.6} color="white" />
				</Pressable>
			)}
		</View>
	)

	return (
		<View style={[{ borderRadius, overflow: 'hidden' }, containerStyle]}>
			<Image
				{...imageProps}
				key={reloadKey}
				recyclingKey={recyclingKey ? `${recyclingKey}-${reloadKey}` : undefined}
				style={style}
				onLoadStart={() => {
					setStatus('loading')
					onLoadStart?.()
				}}
				onLoad={(e) => {
					setStatus('loaded')
					onLoad?.(e)
				}}
				onError={(e) => {
					setStatus('error')
					onError?.(e)
				}}
			/>

			{!disableLoadingOverlay &&
				status !== 'loaded' &&
				(blurDisabled ? (
					<View
						style={[StyleSheet.absoluteFill, styles.plainOverlay]}
						pointerEvents={status === 'error' ? 'auto' : 'none'}
					>
						{OverlayContent}
					</View>
				) : (
					<BlurView
						intensity={blurIntensity}
						tint="dark"
						blurTarget={blurTargetRef}
						style={StyleSheet.absoluteFill}
						pointerEvents={status === 'error' ? 'auto' : 'none'}
					>
						{OverlayContent}
					</BlurView>
				))}
		</View>
	)
}

const styles = StyleSheet.create({
	overlayCenter: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	plainOverlay: {
		backgroundColor: 'rgba(0,0,0,0.35)'
	},
	circle: {
		backgroundColor: 'rgba(0,0,0,0.45)',
		alignItems: 'center',
		justifyContent: 'center'
	}
})

export default SmartImage
