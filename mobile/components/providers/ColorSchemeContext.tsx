import { Image, Canvas, mix, vec, ImageShader, Circle, dist, Skia } from '@shopify/react-native-skia'
import { StatusBar } from 'expo-status-bar'
import type { ReactNode, RefObject } from 'react'
import { createContext, useCallback, useContext, useReducer, useRef } from 'react'
import { Appearance, Dimensions, View, StyleSheet } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'
import { captureRef } from 'react-native-view-shot'

// --- Вспомогательная задержка ---
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Типы ---
export type ColorSchemeName = 'light' | 'dark'

interface ColorScheme {
	active: boolean
	statusBarStyle: ColorSchemeName
	colorScheme: ColorSchemeName
	overlay1: ReturnType<typeof Skia.Image.MakeImageFromEncoded> | null
	overlay2: ReturnType<typeof Skia.Image.MakeImageFromEncoded> | null
}

interface ColorSchemeContext extends ColorScheme {
	ref: RefObject<View | null>
	transition: SharedValue<number>
	circle: SharedValue<{ x: number; y: number; r: number }>
	dispatch: (scheme: ColorScheme) => void
}

// --- Context и reducer ---
const defaultValue: ColorScheme = {
	active: false,
	statusBarStyle: (Appearance.getColorScheme() ?? 'light') === 'light' ? 'dark' : 'light',
	colorScheme: Appearance.getColorScheme() ?? 'light',
	overlay1: null,
	overlay2: null
}

const ColorSchemeContext = createContext<ColorSchemeContext | null>(null)

const colorSchemeReducer = (_: ColorScheme, colorScheme: ColorScheme) => colorScheme

export const useColorScheme = () => {
	const ctx = useContext(ColorSchemeContext)
	if (!ctx) throw new Error('No ColorScheme context found')
	const { colorScheme, dispatch, ref, transition, circle, active } = ctx

	const toggle = useCallback(
		async (x: number, y: number) => {
			if (!ref.current) return

			const newColorScheme = colorScheme === 'light' ? 'dark' : 'light'
			circle.value = { x, y, r: Math.max(...corners.map((c) => dist(c, { x, y }))) }

			dispatch({ active: true, colorScheme, overlay1: null, overlay2: null, statusBarStyle: newColorScheme })

			// --- 1. Screenshot текущего состояния ---
			await wait(50) // ждём рендер
			const uri1Base64 = await captureRef(ref, { format: 'png', quality: 1, result: 'base64' })
			const overlay1 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(uri1Base64))

			dispatch({ active: true, colorScheme, overlay1, overlay2: null, statusBarStyle: newColorScheme })

			// --- 2. Переключаем цветовую схему ---
			await wait(16)
			dispatch({
				active: true,
				colorScheme: newColorScheme,
				overlay1,
				overlay2: null,
				statusBarStyle: newColorScheme
			})

			// --- 3. Screenshot нового состояния ---
			await wait(50)
			const uri2Base64 = await captureRef(ref, { format: 'png', quality: 1, result: 'base64' })
			const overlay2 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(uri2Base64))

			dispatch({ active: true, colorScheme: newColorScheme, overlay1, overlay2, statusBarStyle: newColorScheme })

			// --- 4. Анимация перехода ---
			transition.value = 0
			transition.value = withTiming(1, { duration: 650 })
			await wait(650)

			dispatch({
				active: false,
				colorScheme: newColorScheme,
				overlay1: null,
				overlay2: null,
				statusBarStyle: newColorScheme === 'light' ? 'dark' : 'light'
			})
		},
		[circle, colorScheme, dispatch, ref, transition]
	)

	return { colorScheme, toggle, active }
}

// --- Размер экрана ---
const { width, height } = Dimensions.get('window')
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)]

// --- Provider ---
interface ColorSchemeProviderProps {
	children: ReactNode
}

export const ColorSchemeProvider = ({ children }: ColorSchemeProviderProps) => {
	const circle = useSharedValue({ x: 0, y: 0, r: 0 })
	const transition = useSharedValue(0)
	const ref = useRef<View>(null)

	const [{ colorScheme, overlay1, overlay2, active, statusBarStyle }, dispatch] = useReducer(
		colorSchemeReducer,
		defaultValue
	)

	const r = useDerivedValue(() => mix(transition.value, 0, circle.value.r))

	return (
		<View style={{ flex: 1 }}>
			<StatusBar style={statusBarStyle} />
			<View ref={ref} style={{ flex: 1 }} collapsable={false}>
				<ColorSchemeContext.Provider
					value={{
						active,
						colorScheme,
						overlay1,
						overlay2,
						dispatch,
						ref,
						transition,
						circle,
						statusBarStyle
					}}
				>
					{children}
				</ColorSchemeContext.Provider>
			</View>

			<View style={StyleSheet.absoluteFill} pointerEvents="none">
				<Canvas style={StyleSheet.absoluteFill}>
					{overlay1 && <Image image={overlay1} x={0} y={0} width={width} height={height} />}
					{overlay2 && (
						<Circle c={circle} r={r}>
							<ImageShader image={overlay2} x={0} y={0} width={width} height={height} fit="cover" />
						</Circle>
					)}
				</Canvas>
			</View>
		</View>
	)
}
