import { SaveFormat } from 'expo-image-manipulator'
import CropSvg from '@/components/svg/CropSvg'
import React from 'react'
import AROneToOne from '@/components/svg/AROneToOne'
import ARSixteenToNine from '@/components/svg/ARSixteenToNine'
import ARNineToSixteen from '@/components/svg/ARNineToSixteen'
import ARFourToThree from '@/components/svg/ARFourToThree'
import ARThreeToFour from '@/components/svg/ARThreeToFour'

type IconProps = {
	color?: string
	size?: number
}

export type AspectRatioPreset = {
	icon: React.ComponentType<IconProps>
	label: string
	value: number | null // null = свободный кроп
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
	{ icon: CropSvg, label: 'Free', value: null },
	{ icon: AROneToOne, label: '1:1', value: 1 },
	{ icon: ARFourToThree, label: '4:3', value: 4 / 3 },
	{ icon: ARThreeToFour, label: '3:4', value: 3 / 4 },
	{ icon: ARSixteenToNine, label: '16:9', value: 16 / 9 },
	{ icon: ARNineToSixteen, label: '9:16', value: 9 / 16 }
]

/** Форма рамки кропа. 'circle' всегда подразумевает пропорции 1:1. */
export type CropFrame = 'square' | 'circle'

export type ImageEditorResult = {
	uri: string
	width: number
	height: number
	base64?: string
}

export type ImageEditorFinalizeOptions = {
	/** Итоговый размер результата (пропорции сохраняются, если указана только одна сторона) */
	resize?: { width?: number; height?: number }
	format?: SaveFormat
	compress?: number // 0..1
	base64?: boolean
}

export type Rect = {
	x: number
	y: number
	width: number
	height: number
}

export const MIN_CROP_SIZE = 48
