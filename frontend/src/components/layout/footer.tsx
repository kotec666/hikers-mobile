import { AppGallerySmallSvg, AppStoreSmallSvg, GooglePlaySmallSvg, RustoreSmallSvg } from '@/components/svg'
import Container from '@/components/layout/container'

export function Footer() {
	return (
		<footer className="bg-black-0d border-t border-[#1a1a1a] py-8">
			<Container>
				<div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
					<div className="flex flex-col gap-6">
						<div className="flex gap-6 text-sm justify-between sm:justify-start">
							<a href="#" className="text-[#ababab] hover:text-white transition-colors">
								Карты
							</a>
							<a href="#" className="text-[#ababab] hover:text-white transition-colors">
								Политика
							</a>
							<a href="#" className="text-[#ababab] hover:text-white transition-colors">
								Условия
							</a>
						</div>
						<div className="flex flex-row flex-wrap justify-center gap-3">
							<AppStoreSmallSvg />
							<GooglePlaySmallSvg />
							<RustoreSmallSvg />
							<AppGallerySmallSvg />
						</div>
					</div>
					<div className="text-[#ababab] text-sm">© ХАЙКЕРС</div>
				</div>
			</Container>
		</footer>
	)
}
