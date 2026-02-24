import { createBox, createText, createTheme, useTheme as useThemeRS } from '@shopify/restyle'
import { ColorSchemeName } from '@/components/providers/ColorSchemeContext'
import { Colors } from '@/constants/Colors'

export const darkColors = {
	mainBackground: Colors['black-0d'],
	secondaryBackground: Colors['black-44'],
	cardBackground: Colors['black-25'],
	border: Colors['black-5c'],
	textPrimary: Colors['white'],
	textSecondary: Colors['gray-ab'],
	textSuccess: Colors['green-main'],
	subText: Colors['gray-d9'],
	gray92: Colors['gray-92'],
	primary: Colors['blue-3a'],
	success: Colors['green-main'],
	green20d: Colors['green-20d'],
	warning: Colors['yellow-main'],
	error: Colors['red-ff']
}

export const lightColors = {
	mainBackground: Colors['gray-f7'],
	secondaryBackground: Colors['gray-d9'],
	cardBackground: Colors['gray-d5'],
	border: Colors['gray-92'],
	textPrimary: Colors['black-0d'],
	textSecondary: Colors['gray-d9'],
	textSuccess: Colors['green-main'],
	subText: Colors['gray-ab'],
	gray92: Colors['gray-92'],
	primary: Colors['blue-3a'],
	success: Colors['green-main'],
	green20d: Colors['green-20d'],
	warning: Colors['yellow-main'],
	error: Colors['red-ff']
}

export const lightTheme = createTheme({
	colorScheme: 'light' as ColorSchemeName,
	//@TODO colors: lightColors,
	colors: darkColors,
	spacing: { s: 8, m: 16, l: 24, xl: 40 },
	textVariants: { defaults: { color: 'textPrimary' } }
})

export const darkTheme: Theme = {
	...lightTheme,
	colorScheme: 'dark',
	colors: darkColors
}

export type Theme = typeof lightTheme
export type ThemeColors = Theme['colors']

export const Box = createBox<Theme>()
export const Text = createText<Theme>()
export const useTheme = useThemeRS<Theme>
