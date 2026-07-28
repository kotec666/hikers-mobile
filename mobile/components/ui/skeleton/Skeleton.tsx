import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DimensionValue, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
	Easing,
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/Colors'

const SKELETON_BASE = Colors['black-25']
const SKELETON_HIGHLIGHT = 'rgba(255,255,255,0.16)'

export type SkeletonProps = {
	/** Ширина блока. По умолчанию — 100% контейнера */
	width?: DimensionValue
	/** Высота блока */
	height?: DimensionValue
	borderRadius?: number
	/** Цвет "подложки" */
	baseColor?: string
	/** Цвет блика шиммера */
	highlightColor?: string
	/** Длительность одного прохода шиммера, мс */
	duration?: number
	/** Задержка старта (один раз, до начала бесконечного цикла) — удобно для "волны" по списку */
	delay?: number
	style?: ViewStyle
	className?: string
}

/**
 * Базовый скелетон-блок с бегущим шиммером (reanimated worklet + LinearGradient).
 * Ширина контейнера измеряется через onLayout, дальше вся анимация идёт на UI-потоке.
 */
export function Skeleton({
	width = '100%',
	height = 16,
	borderRadius = 8,
	baseColor = SKELETON_BASE,
	highlightColor = SKELETON_HIGHLIGHT,
	duration = 1300,
	delay = 0,
	style,
	className
}: SkeletonProps) {
	const reduceMotion = useReducedMotion()
	const [layoutWidth, setLayoutWidth] = useState(0)
	const progress = useSharedValue(0)

	useEffect(() => {
		if (reduceMotion) {
			// Уважаем "Reduce Motion" — мягкая пульсация вместо движущегося блика
			progress.value = withDelay(
				delay,
				withRepeat(withTiming(1, { duration: duration * 1.4, easing: Easing.inOut(Easing.ease) }), -1, true)
			)
			return
		}
		// ВАЖНО: delay должен быть снаружи withRepeat, иначе он будет
		// применяться на каждом повторе цикла, а не один раз перед стартом.
		progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false))
	}, [progress, duration, delay, reduceMotion])

	const onLayout = useCallback((e: LayoutChangeEvent) => {
		setLayoutWidth(e.nativeEvent.layout.width)
	}, [])

	const shimmerStyle = useAnimatedStyle(() => {
		if (reduceMotion) {
			return { opacity: interpolate(progress.value, [0, 1], [0.35, 1]) }
		}
		const translateX = interpolate(progress.value, [0, 1], [-layoutWidth, layoutWidth], Extrapolation.CLAMP)
		return { transform: [{ translateX }] }
	}, [layoutWidth, reduceMotion])

	return (
		<View
			onLayout={onLayout}
			className={className}
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: baseColor,
					overflow: 'hidden'
				},
				style
			]}
		>
			{reduceMotion ? (
				<Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: highlightColor }, shimmerStyle]} />
			) : (
				layoutWidth > 0 && (
					<Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
						<LinearGradient
							colors={['transparent', highlightColor, 'transparent']}
							locations={[0.35, 0.5, 0.65]}
							start={{ x: 0, y: 0.5 }}
							end={{ x: 1, y: 0.5 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>
				)
			)}
		</View>
	)
}

export function SkeletonCircle({
	size = 40,
	...rest
}: Omit<SkeletonProps, 'width' | 'height' | 'borderRadius'> & { size?: number }) {
	return <Skeleton width={size} height={size} borderRadius={size / 2} {...rest} />
}

export type SkeletonTextProps = {
	/** Количество строк */
	lines?: number
	lineHeight?: number
	gap?: number
	/** Ширина последней строки (обычно короче) */
	lastLineWidth?: DimensionValue
	style?: ViewStyle
} & Omit<SkeletonProps, 'width' | 'height' | 'style'>

/** Несколько строк "текста", последняя — короче остальных */
export function SkeletonText({
	lines = 3,
	lineHeight = 12,
	gap = 8,
	lastLineWidth = '60%',
	style,
	...rest
}: SkeletonTextProps) {
	const widths = useMemo(
		() =>
			Array.from({ length: lines }, (_, i) =>
				i === lines - 1 ? lastLineWidth : (`${88 - ((i * 7) % 20)}%` as DimensionValue)
			),
		[lines, lastLineWidth]
	)

	return (
		<View style={style}>
			{widths.map((w, i) => (
				<Skeleton
					key={i}
					width={w}
					height={lineHeight}
					borderRadius={lineHeight / 2}
					style={i === 0 ? undefined : { marginTop: gap }}
					{...rest}
				/>
			))}
		</View>
	)
}
