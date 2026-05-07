export function AboutCompany() {
	return (
		<section className="bg-[#46CA53] py-16 md:py-20">
			<div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="grid md:grid-cols-3 gap-12">
					{/* Brand & Social */}
					<div className="space-y-6">
						<h3 className="text-2xl md:text-3xl font-bold text-[#0d0d0d]">ХАЙКЕРС</h3>
						<div className="flex gap-4">
							{/* Instagram */}
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-[#0d0d0d] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
								aria-label="Instagram"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#fff"
									strokeWidth="2"
								>
									<rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
									<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
									<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
								</svg>
							</a>

							{/* Twitter/X */}
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-[#0d0d0d] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
								aria-label="Twitter"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#fff"
									strokeWidth="2"
								>
									<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
								</svg>
							</a>

							{/* Facebook */}
							<a
								href="#"
								className="w-10 h-10 rounded-full bg-[#0d0d0d] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
								aria-label="Facebook"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#fff"
									strokeWidth="2"
								>
									<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Company */}
					<div className="space-y-4">
						<h4 className="text-[#0d0d0d] font-bold">Компания</h4>
						<ul className="space-y-2 font-medium">
							<li>
								<a href="#" className="text-[#0d0d0d]/80 hover:text-[#0d0d0d] transition-colors">
									Описание
								</a>
							</li>
						</ul>
					</div>

					{/* Useful Links */}
					<div className="space-y-4">
						<h4 className="text-[#0d0d0d] font-bold">Полезные ссылки</h4>
						<ul className="space-y-2 font-medium">
							<li>
								<a href="#" className="text-[#0d0d0d]/80 hover:text-[#0d0d0d] transition-colors">
									Поддержка
								</a>
							</li>
							<li>
								<a href="#" className="text-[#0d0d0d]/80 hover:text-[#0d0d0d] transition-colors">
									Контакты
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}
