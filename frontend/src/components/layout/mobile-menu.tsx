import { Button } from '@/components/ui/button'
import { IContentBlock, SectionId } from '@/app/page'

type MobileMenuContentProps = {
	menuItems?: IContentBlock[]
	onItemClick: (sectionId: SectionId) => void
	onDownloadPress: () => void
}

export const MobileMenuContent = ({ menuItems, onItemClick, onDownloadPress }: MobileMenuContentProps) => {
	return (
		<nav className="flex flex-col p-6 gap-4">
			{menuItems?.map((item) => (
				<button
					key={item.label}
					onClick={() => onItemClick(item.id)}
					className="text-white hover:text-green-main transition-colors py-3 text-lg text-left"
				>
					{item.label}
				</button>
			))}

			<Button onClick={onDownloadPress} variant="green" size="xl" className="w-full">
				Скачать
			</Button>
		</nav>
	)
}
