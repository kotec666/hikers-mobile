import { type AnimatedStyle, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useKeyboardHandler } from 'react-native-keyboard-controller'
import type { ViewStyle } from 'react-native'

type UseKeyboardAnimationParams = {
	/**
	 * Опциональный диапазон смещения.
	 *
	 * Если offset НЕ передан —
	 * элемент двигается на реальную высоту клавиатуры.
	 *
	 * Если offset передан —
	 * элемент двигается в диапазоне:
	 *
	 * `closed -> keyboardHeight + opened`
	 *
	 */
	offset?: {
		/**
		 * Смещение при закрытой клавиатуре.
		 *
		 * @default 0
		 */
		closed?: number

		/**
		 * Смещение при полностью открытой клавиатуре.
		 *
		 * @default 0
		 */
		opened?: number
	}
	type?: 'padding' | 'translate'
	mode?: 'keyboard' | 'shift' // keyboard двигаемся на полную высоту клавиатуры; shift двигаемся на фиксированное значение
	enabled?: boolean // вкл/выкл
}

type UseKeyboardAnimationReturn = {
	/**
	 * Готовый animated style
	 * для keyboard avoiding animation.
	 */
	animatedKeyboardStyle: AnimatedStyle<ViewStyle>
}

/**
 * Hook для плавной keyboard animation
 * с поддержкой interactive gestures.
 *
 * Может работать в двух режимах:
 *
 * 1. Native keyboard mode
 * 2. Offset animation mode
 */
export const useKeyboardAnimation = (params: UseKeyboardAnimationParams = {}): UseKeyboardAnimationReturn => {
	const { enabled = true, type = 'padding', mode = 'keyboard', offset = { opened: 0, closed: 0 } } = params
	const height = useSharedValue(0)
	const progress = useSharedValue(0)

	useKeyboardHandler(
		{
			onMove: (e) => {
				'worklet'
				if (!enabled) return
				height.value = Math.max(0, e.height)
				progress.value = e.progress
			},

			onInteractive: (e) => {
				'worklet'
				if (!enabled) return
				height.value = Math.max(0, e.height)
				progress.value = e.progress
			},

			onEnd: (e) => {
				'worklet'
				if (!enabled) return
				height.value = Math.max(0, e.height)
				progress.value = e.progress
			}
		},
		[]
	)

	const animatedKeyboardStyle = useAnimatedStyle(() => {
		if (!enabled) {
			if (type === 'padding') {
				return {
					paddingBottom: 0
				}
			}

			return {
				transform: [{ translateY: 0 }]
			}
		}

		const closed = offset?.closed ?? 0
		const opened = offset?.opened ?? 0

		let value = 0

		/**
		 * Full keyboard avoidance
		 */
		if (mode === 'keyboard') {
			value = closed + height.value + opened * progress.value
		}

		/**
		 * Small viewport shift only
		 */
		if (mode === 'shift') {
			value = closed + opened * progress.value
		}

		if (type === 'padding') {
			return {
				paddingBottom: value
			}
		}

		return {
			transform: [
				{
					translateY: -value
				}
			]
		}
	}, [enabled, mode, type])

	return {
		animatedKeyboardStyle
	}
}
