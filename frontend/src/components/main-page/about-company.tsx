import Container from '@/components/layout/container'
import { TgSvg, TtSvg, VkSvg } from '@/components/svg'
import Link from 'next/link'
import { env } from '@/consts/env'

enum SocialLinkType {
	VK = 'vk',
	TT = 'tt',
	TG = 'tg'
}
const SocialLink = ({ type }: { type: SocialLinkType }) => {
	const getSocialLinkData = () => {
		switch (type) {
			case SocialLinkType.VK:
				return {
					label: 'вконтакте',
					link: env.vk_link,
					svg: <VkSvg />
				}
			case SocialLinkType.TT:
				return {
					label: 'тикток',
					link: env.tt_link,
					svg: <TtSvg />
				}
			case SocialLinkType.TG:
				return {
					label: 'телеграм',
					link: env.tg_link,
					svg: <TgSvg />
				}
		}
	}

	const socialLinkData = getSocialLinkData()

	if (!socialLinkData.link) return null
	return (
		<li>
			<Link
				href={socialLinkData.link}
				rel="noopener noreferrer"
				target="_blank"
				className="w-10 h-10 rounded-full bg-black-0d flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
				aria-label={socialLinkData.label}
			>
				{socialLinkData.svg}
			</Link>
		</li>
	)
}

export function AboutCompany() {
	const companyLinks = [
		{
			label: 'Описание',
			href: '/company-description'
		}
	]

	const usefulLinks = [
		{
			label: 'Поддержка',
			href: '/support'
		},
		{
			label: 'Контакты',
			href: '/contacts'
		}
	]

	return (
		<section className="bg-[#46CA53] py-16 md:py-20">
			<Container>
				<div className="grid md:grid-cols-3 gap-12">
					{/* Brand & Social */}
					<div className="space-y-6">
						<h3 className="text-2xl md:text-3xl font-bold text-black-0d">ХАЙКЕРС</h3>
						<nav aria-label="Социальные сети">
							<ul className="flex gap-4">
								<SocialLink type={SocialLinkType.VK} />
								<SocialLink type={SocialLinkType.TG} />
								<SocialLink type={SocialLinkType.TT} />
							</ul>
						</nav>
					</div>

					{/* Company */}
					<div className="space-y-4">
						<h4 className="text-black-0d font-bold">Компания</h4>
						<ul className="space-y-2 font-medium">
							{companyLinks.map((companyLink) => (
								<li key={companyLink.label}>
									<Link
										href={companyLink.href}
										className="text-black-0d/80 hover:text-black-0d transition-colors"
									>
										{companyLink.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="space-y-4">
						<h4 className="text-black-0d font-bold">Полезные ссылки</h4>
						<ul className="space-y-2 font-medium">
							{usefulLinks.map((usefulLink) => (
								<li key={usefulLink.label}>
									<Link
										href={usefulLink.href}
										className="text-black-0d/80 hover:text-black-0d transition-colors"
									>
										{usefulLink.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Container>
		</section>
	)
}
