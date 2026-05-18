import Link from 'next/link'
import Image from 'next/image'
import icon from '@/assets/images/icon-40x40.png'
import { IContentBlock } from '@/app/page'
import Container from '@/components/layout/container'
import ScrollProgressLine from '@/components/layout/scroll-progress-line'
import HeaderModals from '@/components/layout/header/header-modals'
import { Suspense } from 'react'

export interface IHeaderProps {
	isAnimationLineDisabled?: boolean
	contentBlocks?: IContentBlock[]
}

export function Header({ contentBlocks, isAnimationLineDisabled }: IHeaderProps) {
	return (
		<header className="fixed w-full top-0 z-50 border-b border-[#1a1a1a] bg-black-0d/70">
			<Container>
				<div className="flex items-center h-16 lg:h-20">
					<div className="flex items-center gap-3 w-full">
						<div className="min-w-10 w-10 min-h-10 h-10">
							<Link aria-label="Ссылка на главную страницу" href="/">
								<Image
									src={icon}
									alt=""
									className="w-full h-full object-cover"
									draggable="false"
									priority
								/>
							</Link>
						</div>
						<div>
							<p className="text-white font-semibold text-lg">Hikers</p>
							<p className="text-gray-400 text-xs">Поделись своими достижениями</p>
						</div>
					</div>
					<nav aria-label="Основная навигация" className="mr-8 hidden md:block">
						<ul className="flex items-center justify-end gap-8 w-full">
							{contentBlocks?.map((item) => (
								<li key={item.label}>
									<Link
										href={`#${item.id}`}
										className="text-[#ababab] hover:text-white transition-colors cursor-pointer"
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
					<Suspense fallback={null}>
						<HeaderModals contentBlocks={contentBlocks} />
					</Suspense>
				</div>
			</Container>
			<ScrollProgressLine isAnimationLineDisabled={isAnimationLineDisabled} />
		</header>
	)
}
