import { Button } from '@/components/ui/button'
import { IContentBlock } from '@/app/page'
import Link from 'next/link'

type MobileMenuContentProps = {
	menuItems?: IContentBlock[]
	onItemClick: () => void
	onDownloadPress: () => void
}

export const MobileMenuContent = ({ menuItems, onItemClick, onDownloadPress }: MobileMenuContentProps) => {
	return (
		<nav className="flex flex-col p-6 gap-4">
			{menuItems?.map((item) => (
				<Link
					key={item.label}
					href={`#${item.id}`}
					onClick={onItemClick}
					className="text-white hover:text-green-main transition-colors py-3 text-lg text-left"
				>
					{item.label}
				</Link>
			))}

			<Button onClick={onDownloadPress} variant="green" size="xl" className="w-full">
				Скачать
			</Button>
		</nav>
	)
}
