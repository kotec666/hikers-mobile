import { Button } from '@/components/ui/button'
import { SectionRef } from '@/components/layout/header'

type MobileMenuContentProps = {
	menuItems: {
		title: string
		mobileRef: SectionRef
		desktopRef: SectionRef
	}[]
	onItemClick: (mobileRef: SectionRef, desktopRef: SectionRef) => void
	onDownloadPress: () => void
}

export const MobileMenuContent = ({ menuItems, onItemClick, onDownloadPress }: MobileMenuContentProps) => {
	return (
		<nav className="flex flex-col p-6 gap-4">
			{menuItems.map((item) => (
				<button
					key={item.title}
					onClick={() => onItemClick(item.mobileRef, item.desktopRef)}
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
