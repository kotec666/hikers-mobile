'use client'
// import { Metadata } from 'next'
// import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import PhoneSceneWrapper from '@/app/components/main-page/PhoneSceneWrapper'
import { ContentBlock } from '@/app/components/ui/layout/content-block'
import { Header } from '@/app/components/ui/layout/header'
import { AboutCompany } from '@/app/components/ui/layout/about-company'
import { Footer } from '@/app/components/ui/layout/footer'
import Image from 'next/image'
import AppStoreSvg from '@/assets/svg/app-store-l.svg'
import GooglePlaySvg from '@/assets/svg/google-play-l.svg'
import RustoreSvg from '@/assets/svg/rustore-l.svg'
import AppGallerySvg from '@/assets/svg/app-gallery-l.svg'
import { useRef } from 'react'

// export const metadata: Metadata = generateBasicMetadata({
// 	title: 'Главная страница',
// 	description: 'Описание',
// 	keywords: 'ключевые, слова'
// })

// <div className="fixed z-[-25] top-0 h-screen w-full bg-[radial-gradient(circle,rgb(34,203,90)_0%,rgb(0,0,0)_100%)]" />
export default function Home() {
	const containerRef = useRef<HTMLDivElement>(null)

	const contentBlocks = [
		{
			title: 'Персональные тренировки для вас',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.'
		},
		{
			title: 'Отслеживайте свой прогресс',
			description:
				'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
		},
		{
			title: 'Присоединяйтесь к сообществу',
			description:
				'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.'
		}
	]
	return (
		<div className="min-h-screen bg-[#0d0d0d]">
			<Header />

			<section className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white">
						Тренируйся умнее с современным подходом
					</h1>
					<p className="text-[#ababab] text-lg md:text-xl max-w-2xl mx-auto">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua.
					</p>

					{/* Store Buttons */}
					<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
						<a href="#app-store">
							<Image
								title="Скачать приложение хайкерс в App Store"
								src={AppStoreSvg}
								alt="Скачайте приложение хайкерс из App Store"
								width={148}
								height={44}
								draggable={false}
							/>
						</a>
						<a href="#google-play">
							<Image
								title="Скачать приложение хайкерс в Google Play"
								src={GooglePlaySvg}
								alt="Скачайте приложение хайкерс из Google Play"
								width={148}
								height={44}
								draggable={false}
							/>
						</a>
						<a href="#rustore">
							<Image
								title="Скачать приложение хайкерс в RuStore"
								src={RustoreSvg}
								alt="Скачайте приложение хайкерс из RuStore"
								width={148}
								height={44}
								draggable={false}
							/>
						</a>
						<a href="#appgallery">
							<Image
								title="Скачать приложение хайкерс в AppGallery"
								src={AppGallerySvg}
								alt="Скачайте приложение хайкерс из AppGallery"
								width={148}
								height={44}
								draggable={false}
							/>
						</a>
					</div>
				</div>
			</section>
			<div ref={containerRef} className="relative w-full lg:h-[300dvh]">
				{contentBlocks.map((block, idx) => (
					<ContentBlock idx={idx} key={block.title} title={block.title} description={block.description} />
				))}
				<div className="hidden lg:flex sticky z-10 top-0 h-screen w-full">
					<PhoneSceneWrapper containerRef={containerRef} />
				</div>
			</div>

			<AboutCompany />
			<Footer />
		</div>
	)
}
