import { Button } from '@/components/ui/button'
import { RefObject } from 'react'

type MobileMenuContentProps = {
	menuItems: {
		title: string
		mobileRef: RefObject<HTMLDivElement | null>
		desktopRef: RefObject<HTMLDivElement | null>
	}[]
	onItemClick: (ref: React.RefObject<HTMLDivElement | null>) => void
	onDownloadPress: () => void
}

export const MobileMenuContent = ({ menuItems, onItemClick, onDownloadPress }: MobileMenuContentProps) => {
	return (
		<nav className="flex flex-col p-6 gap-4">
			{menuItems.map((item) => (
				<button
					key={item.title}
					onClick={() => onItemClick(item.mobileRef)}
					className="text-white hover:text-green-main transition-colors py-3 text-lg text-left"
				>
					{item.title}
				</button>
			))}

			<Button onClick={onDownloadPress} variant="green" size="xl" className="w-full">
				Скачать
			</Button>
		</nav>
	)
}
