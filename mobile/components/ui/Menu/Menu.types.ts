import { ReactNode } from 'react'
import { SFSymbols7_0 } from 'sf-symbols-typescript'

export interface MenuAction {
	id: string
	title: string
	/** SF Symbol, используется на iOS в MenuView. */
	image?: SFSymbols7_0
	/** React-иконка, используется на Android в PopupMenu. */
	icon?: ReactNode
	destructive?: boolean
	disabled?: boolean
	onPress?: () => void
}

export interface MenuProps {
	actions: MenuAction[]
	/** Контент триггера. По умолчанию — кнопка с «⋯». */
	children?: ReactNode
	/** Ширина меню на Android (PopupMenu). */
	menuWidth?: number
	/** Максимальная высота меню на Android (PopupMenu). */
	menuHeight?: number
	/** Выключение блюр-эффекта на Android (PopupMenu). */
	blurDisabled?: boolean
}
