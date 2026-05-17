import React from 'react'
import Container from '@/components/layout/container'
import StoreButton, { StoreButtonType } from '@/components/ui/store-button'

export function Footer() {
	return (
		<footer className="bg-black-0d border-t border-[#1a1a1a] py-8">
			<Container>
				<div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
					<div className="flex flex-col gap-6">
						<nav aria-label="Навигация в подвале сайта">
							<ul className="flex gap-6 text-sm justify-between sm:justify-start">
								<li>
									<a href="#" className="text-[#ababab] hover:text-white transition-colors">
										Карты
									</a>
								</li>
								<li>
									<a href="#" className="text-[#ababab] hover:text-white transition-colors">
										Политика
									</a>
								</li>
								<li>
									<a href="#" className="text-[#ababab] hover:text-white transition-colors">
										Условия
									</a>
								</li>
							</ul>
						</nav>
						<div className="flex flex-row flex-wrap justify-center gap-3">
							<StoreButton type="sm" storeType={StoreButtonType.APP_STORE} />
							<StoreButton type="sm" storeType={StoreButtonType.GOOGLE_PLAY} />
							<StoreButton type="sm" storeType={StoreButtonType.RUSTORE} />
							<StoreButton type="sm" storeType={StoreButtonType.APP_GALLERY} />
						</div>
					</div>
					<div className="text-[#ababab] text-sm">© ХАЙКЕРС</div>
				</div>
			</Container>
		</footer>
	)
}
