export interface BottomSheetProps {
	activeHeight: number
	children: React.ReactNode
	backgroundColor?: string
	backDropColor?: string
	blurDisabled?: boolean
	onDoneButton?: boolean
}

export interface BottomSheetHandle {
	openSheet: () => void
	closeSheet: (onFinished?: () => void) => void
}
