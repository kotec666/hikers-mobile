export interface BottomSheetProps {
	activeHeight: number
	children: React.ReactNode
	backgroundColor?: string
	backDropColor?: string
	blurDisabled?: boolean
}

export interface BottomSheetHandle {
	openSheet: () => void
	closeSheet: (onFinished?: () => void) => void
}
