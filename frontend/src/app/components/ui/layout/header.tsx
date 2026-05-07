import Link from 'next/link'
import Image from 'next/image'
import icon from '@/assets/images/icon-40x40.png'

export function Header() {
	return (
		<header className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 lg:h-20">
					<div className="flex items-center gap-3">
						<div className="min-w-10 w-10 min-h-10 h-10">
							<Link href="/">
								<Image
									src={icon}
									alt="На главную страницу"
									className="w-full h-full object-cover"
									draggable="false"
								/>
							</Link>
						</div>
						<div>
							<h1 className="text-white font-semibold text-lg">Hikers</h1>
							<p className="text-gray-400 text-xs">Поделись своими достижениями</p>
						</div>
					</div>

					{/* Navigation Links */}
					<nav className="hidden md:flex items-center gap-8">
						<a href="#trainings" className="text-[#ababab] hover:text-white transition-colors">
							Тренировки
						</a>
						<a href="#publications" className="text-[#ababab] hover:text-white transition-colors">
							Публикации
						</a>
						<a href="#community" className="text-[#ababab] hover:text-white transition-colors">
							Сообщество
						</a>
						<a
							href="#download"
							className="px-6 py-2.5 bg-[#22CB5A] text-[#0d0d0d] rounded-lg hover:bg-[#1eb84d] transition-colors font-medium"
						>
							Скачать
						</a>
					</nav>

					{/* Mobile Menu Button */}
					<button className="md:hidden text-white p-2" aria-label="Открыть меню">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</header>
	)
}
