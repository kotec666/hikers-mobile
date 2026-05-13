'use client'
// import { Metadata } from 'next'
// import { generateBasicMetadata } from '@/helpers/generateBasicMetadata'
import PhoneSceneWrapper from '@/components/main-page/phone-scene-wrapper'
import React, { RefObject, useRef } from 'react'
import GoToSectionButton from '@/components/main-page/go-to-section-button'
import ContentBlock from '@/components/main-page/content-block'
import { AboutCompany } from '@/components/main-page/about-company'
import MainLayout from '@/components/layout/main-layout'
import { screenTextureURLs } from '@/consts/PhoneScreenTextures'
import StoreButton, { StoreButtonType } from '@/components/ui/store-button'

// export const metadata: Metadata = generateBasicMetadata({
// 	title: 'Главная страница',
// 	description: 'Описание',
// 	keywords: 'ключевые, слова'
// })

export enum SectionId {
	TRAININGS = 'trainings',
	PROGRESS = 'progress',
	COMMUNITY = 'community'
}

export default function Home() {
	const containerRef = useRef<HTMLDivElement>(null)

	const handleGoToSection = () => {
		containerRef?.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		})
	}

	const contentBlocks = [
		{
			id: SectionId.TRAININGS,
			title: 'Персональные тренировки для вас',
			mobileImg: screenTextureURLs[0],
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.'
		},
		{
			id: SectionId.PROGRESS,
			title: 'Отслеживайте свой прогресс',
			mobileImg: screenTextureURLs[1],
			description:
				'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.'
		},
		{
			id: SectionId.COMMUNITY,
			title: 'Присоединяйтесь к сообществу',
			mobileImg: screenTextureURLs[2],
			description:
				'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.'
		}
	]

	const sectionRefs: Record<
		SectionId,
		{
			title: string
			mobileRef: RefObject<HTMLDivElement | null>
			desktopRef: RefObject<HTMLDivElement | null>
		}
	> = {
		trainings: {
			title: 'Тренировки',
			mobileRef: useRef<HTMLDivElement>(null),
			desktopRef: useRef<HTMLDivElement>(null)
		},
		progress: {
			title: 'Публикации',
			mobileRef: useRef<HTMLDivElement>(null),
			desktopRef: useRef<HTMLDivElement>(null)
		},
		community: {
			title: 'Сообщество',
			mobileRef: useRef<HTMLDivElement>(null),
			desktopRef: useRef<HTMLDivElement>(null)
		}
	}

	return (
		<div>
			<MainLayout
				headerProps={{
					isAnimationLineDisabled: false,
					sectionRefs
				}}
				mainClassName="bg-black-0d"
			>
				<section className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)] py-20 md:pb-15 px-4 sm:px-6 lg:px-8 flex flex-col">
					<video
						autoPlay
						loop
						muted
						playsInline
						poster="/images/hikers-poster.avif"
						className="absolute inset-0 w-full h-full object-cover"
					>
						<source src="/video/hikers.webm" type="video/webm" />
						<source src="/video/hikers.mp4" type="video/mp4" />
					</video>
					<div className="absolute inset-0 bg-black/50 z-1" />

					<div className="max-w-4xl mx-auto text-center space-y-8 h-full flex flex-col justify-center items-center z-2">
						<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white">
							Тренируйся умнее с современным подходом
						</h1>
						<p className="text-[#ababab] text-lg md:text-xl max-w-2xl mx-auto">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
							labore et dolore magna aliqua.
						</p>

						<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
							<StoreButton type="lg" storeType={StoreButtonType.APP_STORE} />
							<StoreButton type="lg" storeType={StoreButtonType.GOOGLE_PLAY} />
							<StoreButton type="lg" storeType={StoreButtonType.RUSTORE} />
							<StoreButton type="lg" storeType={StoreButtonType.APP_GALLERY} />
						</div>
					</div>
					<div className="mt-auto pt-5 w-full flex justify-center z-2">
						<GoToSectionButton goToSection={handleGoToSection} />
					</div>
				</section>
				<div ref={containerRef} className="relative w-full lg:h-[300dvh]">
					{contentBlocks.map((block, idx) => (
						<ContentBlock
							key={block.id}
							mobileImg={block.mobileImg}
							mobileRef={sectionRefs[block.id as SectionId].mobileRef}
							desktopRef={sectionRefs[block.id as SectionId].desktopRef}
							idx={idx}
							title={block.title}
							description={block.description}
						/>
					))}
					<div className="hidden lg:flex sticky z-10 top-0 h-screen w-full">
						<PhoneSceneWrapper containerRef={containerRef} />
					</div>
				</div>

				<AboutCompany />
			</MainLayout>
		</div>
	)
}
